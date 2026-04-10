import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; //Librería para hashear password
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';
import { UserMembresia } from '../membresia/entities/userMembresia.entity';
import { EstadoUserMembresia } from '../membresia/entities/estadoUserMembresia.entity';
import { Membresia } from '../membresia/entities/membresia.entity';
import { Pago } from '../membresia/entities/pago.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) // Inyecta el repositorio de TypeORM y permite hacer Querys
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMembresia)
    private readonly userMembresiaRepository: Repository<UserMembresia>,
    @InjectRepository(EstadoUserMembresia)
    private readonly estadoUserMembresiaRepository: Repository<EstadoUserMembresia>,
    @InjectRepository(Membresia)
    private readonly membresiaRepository: Repository<Membresia>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    // VALIDACIÓN PREVIA: Verificar si el email ya existe
    // Esto previene la mayoría de registros duplicados en desarrollo normal
    const userExists = await this.userRepository.findOne({
      where: { email: normalizedEmail }
    });

    if (userExists) {
      throw new ConflictException('El correo electronico ya esta registrado.');
    }

    // En desarrollo local usamos menos rondas para mejorar tiempos de respuesta.
    const defaultRounds = process.env.NODE_ENV === 'production' ? 10 : 8;
    const configuredRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? defaultRounds);
    const saltRounds = Number.isFinite(configuredRounds) && configuredRounds > 3
      ? configuredRounds
      : defaultRounds;

    //HASHEAR PASSWORD: NUNCA guardes contraseña en plano
    //bcrypt genera un hash + salt
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    //CREAR OBJETO USER para guardar en BD
    const newUser = this.userRepository.create({
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      email: normalizedEmail,
      dni: createUserDto.dni,
      password_hash: hashedPassword, // Guardamos el HASH
      role: UserRole.CLIENTE,
      estado: UserStatus.CREADO,
      // membresias y planEntrenamiento se inicializan null/vacío automáticamente
    });

    //GUARDAR EN BASE DE DATOS
    // Try-catch como respaldo para race conditions en requests concurrentes
    let userSaved: User;
    try {
      userSaved = await this.userRepository.save(newUser);
    } catch (error) {
      // Maneja conflictos de unicidad en DB (ej. dos registros concurrentes con el mismo email)
      if (error instanceof QueryFailedError && (error as any).driverError?.code === '23505') {
        throw new ConflictException('El correo electronico ya esta registrado.');
      }
      throw error;
    }

    //RESPUESTA: Devolver usuario SIN la password
    // Hacemos un objeto nuevo excluyendo password_hash
    return this.sanitizeUser(userSaved);
  }

  async findAll() {
    const users = await this.userRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findCreatedUsers() {
    console.log('[UsersService.findCreatedUsers] Iniciando busqueda de usuarios pendientes');

    const users = await this.userRepository.find({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        role: true,
        estado: true,
      },
      order: { id: 'ASC' },
    });

    console.log(`[UsersService.findCreatedUsers] Usuarios leidos desde DB: ${users.length}`);

    const normalize = (value: unknown): string => String(value ?? '').trim().toLowerCase();

    const pendingUsers = users
      .filter((user) => {
        const normalizedRole = normalize(user.role);
        const normalizedEstado = normalize(user.estado);

        const isClient = normalizedRole === normalize(UserRole.CLIENTE);
        const isCreated = normalizedEstado === '' || normalizedEstado === normalize(UserStatus.CREADO);

        if (!isClient || !isCreated) {
          console.log('[UsersService.findCreatedUsers] Usuario descartado por filtro', {
            id: user.id,
            roleOriginal: user.role,
            estadoOriginal: user.estado,
            roleNormalizado: normalizedRole,
            estadoNormalizado: normalizedEstado,
            isClient,
            isCreated,
          });
        }

        return isClient && isCreated;
      })
      .map((user) => ({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        estado: UserStatus.CREADO,
      }));

    console.log(
      '[UsersService.findCreatedUsers] Usuarios pendientes devueltos:',
      pendingUsers.map((user) => ({ id: user.id, dni: user.dni, estado: user.estado })),
    );

    return pendingUsers;
  }

  async findActiveClients() {
    console.log('[UsersService.findActiveClients] Buscando usuarios activos');

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.userMembresias',
        'userMembresias'
      )
      .leftJoinAndSelect(
        'userMembresias.membresia',
        'membresia'
      )
      .leftJoinAndSelect(
        'membresia.tipoMembresia',
        'tipoMembresia'
      )
      .leftJoinAndSelect(
        'userMembresias.estado',
        'estadoUserMembresia'
      )
      .where('user.role = :role', { role: UserRole.CLIENTE })
      .andWhere("LOWER(TRIM(COALESCE(user.estado, :fallback))) = :estado", {
        fallback: UserStatus.CREADO,
        estado: UserStatus.ACTIVO,
      })
      .orderBy('user.id', 'ASC')
      .getMany();

    console.log(
      '[UsersService.findActiveClients] Usuarios encontrados:',
      users.map((u) => ({ id: u.id, email: u.email, estado: u.estado }))
    );

    const response = users.map((user) => {
      const sortedMemberships = [...(user.userMembresias ?? [])].sort((a, b) => {
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateDiff !== 0) {
          return dateDiff;
        }

        return (b.id ?? 0) - (a.id ?? 0);
      });

      const latestMembership = sortedMemberships[0];

      const membership = latestMembership?.membresia;
      const membershipStateName = latestMembership?.estado?.nombre?.toUpperCase();
      const isUpToDate = membershipStateName === 'AL_DIA';

      const memberships = sortedMemberships.map((item) => ({
        membresiaId: item.membresiaId,
        tipoMembresiaId: item.membresia?.tipoMembresia?.id ?? null,
        nombre: item.membresia?.nombre ?? 'Sin membresia',
        dias: item.membresia?.dias ?? '',
        estadoPago: String(item.estado?.nombre ?? '').toUpperCase() === 'AL_DIA' ? 'alDia' : 'cuotaPendiente',
      }));

      return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        email: user.email,
        estado: user.estado,
        membresiaId: membership?.id ?? null,
        tipoMembresiaId: membership?.tipoMembresia?.id ?? null,
        membresia: membership?.nombre ?? 'Sin membresia',
        frecuenciaDias: membership?.dias ?? '',
        estadoPago: isUpToDate ? 'alDia' : 'cuotaPendiente',
        membresias: memberships,
      };
    });

    console.log('[UsersService.findActiveClients] Respuesta final clientes-activos:', response);

    return response;
  }

  async removeMembershipByAdmin(userId: number, membresiaId: number) {
    const membership = await this.userMembresiaRepository.findOne({
      where: { userId, membresiaId },
      relations: ['membresia', 'membresia.tipoMembresia'],
    });

    if (!membership) {
      throw new NotFoundException('La membresia indicada no esta asignada al usuario.');
    }

    const paymentsCount = await this.pagoRepository.count({
      where: { userMembresiaId: membership.id },
    });

    if (paymentsCount > 0) {
      throw new ConflictException('No se puede eliminar la membresia del usuario porque tiene pagos asociados.');
    }

    await this.userMembresiaRepository.remove(membership);

    return {
      message: 'Membresia eliminada del usuario correctamente.',
      userId,
      membresiaId,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    return this.sanitizeUser(user);
  }

  async updateEstado(id: number, estado: UserStatus) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    user.estado = estado;
    const updated = await this.userRepository.save(user);
    return this.sanitizeUser(updated);
  }

  async updateMembershipByAdmin(userId: number, membresiaId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${userId}`);
    }

    const membresia = await this.membresiaRepository.findOne({
      where: { id: membresiaId },
      relations: ['tipoMembresia'],
    });
    if (!membresia) {
      throw new NotFoundException(`No se encontro la membresia con id ${membresiaId}`);
    }

    if (!membresia.tipoMembresia?.id) {
      throw new NotFoundException(`La membresia ${membresiaId} no tiene tipo de membresia asociado`);
    }

    if (membresia.tipoMembresia.id !== 1 && membresia.tipoMembresia.id !== 2) {
      throw new BadRequestException('Solo se puede actualizar membresias de tipo entrenamiento (1) o complementaria (2).');
    }

    const estadoPendiente = await this.estadoUserMembresiaRepository.findOne({
      where: { nombre: 'PENDIENTE_PAGO' },
    });

    if (!estadoPendiente) {
      throw new NotFoundException('Estado PENDIENTE_PAGO no encontrado');
    }

    // MEMBRESIA COMPLEMENTARIA (2): al agregar usuario se crea (o reactiva) una relacion en user_membresia
    // sin sobrescribir la membresia de entrenamiento.
    if (membresia.tipoMembresia.id === 2) {
      const existingSecondaryMembership = await this.userMembresiaRepository.findOne({
        where: { userId, membresiaId },
        relations: ['membresia', 'estado'],
      });

      if (existingSecondaryMembership) {
        existingSecondaryMembership.estadoId = estadoPendiente.id;
        existingSecondaryMembership.membresia = membresia;

        const updatedSecondaryMembership = await this.userMembresiaRepository.save(existingSecondaryMembership);

        return this.userMembresiaRepository.findOne({
          where: { id: updatedSecondaryMembership.id },
          relations: ['membresia', 'estado'],
        });
      }

      const createdSecondaryMembership = this.userMembresiaRepository.create({
        userId,
        membresiaId,
        estadoId: estadoPendiente.id,
        membresia,
      });

      const savedSecondaryMembership = await this.userMembresiaRepository.save(createdSecondaryMembership);

      return this.userMembresiaRepository.findOne({
        where: { id: savedSecondaryMembership.id },
        relations: ['membresia', 'estado'],
      });
    }

    const userMemberships = await this.userMembresiaRepository.find({
      where: { userId },
      relations: ['membresia', 'membresia.tipoMembresia', 'estado'],
      order: { id: 'DESC' },
    });

    const trainingMemberships = userMemberships.filter(
      (item) => item.membresia?.tipoMembresia?.id === 1,
    );

    // Si el usuario esta sin membresia de entrenamiento, creamos la instancia base en user_membresia.
    if (trainingMemberships.length === 0) {
      const createdMembership = this.userMembresiaRepository.create({
        userId,
        membresiaId,
        estadoId: estadoPendiente.id,
      });

      const savedCreatedMembership = await this.userMembresiaRepository.save(createdMembership);

      await this.userMembresiaRepository.update(savedCreatedMembership.id, {
        createdAt: new Date(),
      });

      return this.userMembresiaRepository.findOne({
        where: { id: savedCreatedMembership.id },
        relations: ['membresia', 'estado'],
      });
    }

    let pointerMembership: UserMembresia;

    const targetMembership = trainingMemberships.find(
      (item) => item.membresiaId === membresiaId,
    );

    // Si la membresia destino ya existe, la reutilizamos como puntero.
    if (targetMembership) {
      pointerMembership = targetMembership;
    } else {
      // Caso normal: sobreescribimos el puntero actual.
      pointerMembership = trainingMemberships[0];
      pointerMembership.membresiaId = membresiaId;
      pointerMembership.membresia = membresia;
    }

    pointerMembership.estadoId = estadoPendiente.id;

    // Si ya existia la fila destino, igual sincronizamos la relacion para evitar que save()
    // persista el FK anterior por tener la relacion cargada en memoria.
    pointerMembership.membresiaId = membresiaId;
    pointerMembership.membresia = membresia;

    const savedMembership = await this.userMembresiaRepository.save(pointerMembership);

    // Marcamos como vigente la fila puntero para que se refleje en listados.
    await this.userMembresiaRepository.update(savedMembership.id, {
      createdAt: new Date(),
    });

    return this.userMembresiaRepository.findOne({
      where: { id: savedMembership.id },
      relations: ['membresia', 'estado'],
    });
  }

  async markPaymentAsUpToDateByAdmin(userId: number, membresiaId?: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${userId}`);
    }

    let latestMembership: UserMembresia | null = null;

    if (membresiaId) {
      latestMembership = await this.userMembresiaRepository.findOne({
        where: { userId, membresiaId },
        relations: ['membresia'],
      });
    }

    if (!latestMembership) {
      latestMembership = await this.userMembresiaRepository
        .createQueryBuilder('userMembresia')
        .leftJoinAndSelect('userMembresia.membresia', 'membresia')
        .where('userMembresia.userId = :userId', { userId })
        .orderBy('userMembresia.createdAt', 'DESC')
        .getOne();
    }

    if (!latestMembership) {
      throw new NotFoundException('El usuario no tiene membresia asignada');
    }

    const estadoAlDia = await this.estadoUserMembresiaRepository.findOne({
      where: { nombre: 'AL_DIA' },
    });

    if (!estadoAlDia) {
      throw new NotFoundException('Estado AL_DIA no encontrado');
    }

    await this.userMembresiaRepository.update(
      { userId: latestMembership.userId, membresiaId: latestMembership.membresiaId },
      { estadoId: estadoAlDia.id },
    );

    const refreshedMembership = await this.userMembresiaRepository.findOne({
      where: { userId: latestMembership.userId, membresiaId: latestMembership.membresiaId },
      relations: ['membresia', 'estado'],
    });

    if (!refreshedMembership) {
      throw new NotFoundException('No se pudo recuperar la membresia del usuario luego de actualizar el estado.');
    }

    const pago = this.pagoRepository.create({
      userId,
      userMembresiaId: refreshedMembership.id,
      membresiaId: refreshedMembership.membresiaId,
      user: { id: userId } as User,
      userMembresia: { id: refreshedMembership.id } as UserMembresia,
      membresia: { id: refreshedMembership.membresiaId } as Membresia,
    });
    const savedPayment = await this.pagoRepository.save(pago);

    return {
      message: 'Pago actualizado a al dia',
      pagoId: savedPayment.id,
      userId,
      userMembresiaId: refreshedMembership.id,
      membresiaId: latestMembership.membresiaId,
      createdAt: savedPayment.createdAt,
    };
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    return { message: 'Usuario eliminado correctamente.' };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...result } = user;
    return result;
  }
}
