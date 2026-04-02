import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { Membresia } from './entities/membresia.entity';
import { Pago } from './entities/pago.entity';
import { TipoMembresia } from './entities/tipoMembresia.entity';
import { EstadoUserMembresia } from './entities/estadoUserMembresia.entity';
import { UserMembresia } from './entities/userMembresia.entity';

@Injectable()
export class MembresiaService {
  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepository: Repository<Membresia>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(TipoMembresia)
    private readonly tipoMembresiaRepository: Repository<TipoMembresia>,
    @InjectRepository(EstadoUserMembresia)
    private readonly estadoUserMembresiaRepository: Repository<EstadoUserMembresia>,
    @InjectRepository(UserMembresia)
    private readonly userMembresiaRepository: Repository<UserMembresia>,
  ) {}

  async create(createMembresiaDto: CreateMembresiaDto) {
    const tipoMembresia = await this.findTipoMembresiaById(createMembresiaDto.tipoMembresiaId);

    const membresia = this.membresiaRepository.create({
      nombre: createMembresiaDto.nombre.trim(),
      dias: createMembresiaDto.dias,
      costo: createMembresiaDto.costo,
      tipoMembresia,
    });

    return this.membresiaRepository.save(membresia);
  }

  async findAll() {
    return this.membresiaRepository.find({
      relations: ['tipoMembresia'],
      order: { id: 'ASC' },
    });
  }

  async findAllTiposMembresia() {
    return this.tipoMembresiaRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    return this.findMembresiaById(id);
  }

  async findMembresiaById(id: number) {
    const membresia = await this.membresiaRepository.findOne({ where: { id } });

    if (!membresia) {
      throw new NotFoundException(`No se encontro la membresia con id ${id}`);
    }

    return membresia;
  }

  async findPagoById(id: number) {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['user', 'membresia', 'userMembresia', 'userMembresia.membresia', 'userMembresia.estado'],
    });

    if (!pago) {
      throw new NotFoundException(`No se encontro el pago con id ${id}`);
    }

    return pago;
  }

  async findTipoMembresiaById(id: number) {
    const tipoMembresia = await this.tipoMembresiaRepository.findOne({ where: { id } });

    if (!tipoMembresia) {
      throw new NotFoundException(`No se encontro el tipo de membresia con id ${id}`);
    }

    return tipoMembresia;
  }

  async findEstadoUserMembresiaById(id: number) {
    const estado = await this.estadoUserMembresiaRepository.findOne({ where: { id } });

    if (!estado) {
      throw new NotFoundException(`No se encontro el estado de membresia con id ${id}`);
    }

    return estado;
  }

  async update(id: number, updateMembresiaDto: UpdateMembresiaDto) {
    const membresia = await this.membresiaRepository.findOne({
      where: { id },
      relations: ['tipoMembresia'],
    });

    if (!membresia) {
      throw new NotFoundException(`No se encontro la membresia con id ${id}`);
    }

    if (typeof updateMembresiaDto.nombre === 'string') {
      membresia.nombre = updateMembresiaDto.nombre.trim();
    }

    if (typeof updateMembresiaDto.dias === 'number') {
      membresia.dias = updateMembresiaDto.dias;
    }

    if (typeof updateMembresiaDto.costo === 'number') {
      membresia.costo = updateMembresiaDto.costo;
    }

    if (typeof updateMembresiaDto.tipoMembresiaId === 'number') {
      membresia.tipoMembresia = await this.findTipoMembresiaById(updateMembresiaDto.tipoMembresiaId);
    }

    await this.membresiaRepository.save(membresia);

    return this.membresiaRepository.findOne({
      where: { id },
      relations: ['tipoMembresia'],
    });
  }

  async remove(id: number) {
    const membresia = await this.membresiaRepository.findOne({
      where: { id },
      relations: ['tipoMembresia'],
    });

    if (!membresia) {
      throw new NotFoundException(`No se encontro la membresia con id ${id}`);
    }

    const assignedUsersCount = await this.userMembresiaRepository.count({
      where: { membresiaId: id },
    });

    if (assignedUsersCount > 0) {
      throw new ConflictException('No se puede eliminar la membresia porque esta asignada a usuarios.');
    }

    const pagosCount = await this.pagoRepository
      .createQueryBuilder('pago')
      .innerJoin('pago.userMembresia', 'userMembresia')
      .where('userMembresia.membresiaId = :membresiaId', { membresiaId: id })
      .getCount();

    if (pagosCount > 0) {
      throw new ConflictException('No se puede eliminar la membresia porque tiene pagos registrados.');
    }

    await this.membresiaRepository.remove(membresia);

    return { message: 'Membresia eliminada correctamente.', id };
  }

  private async hasCurrentMonthPayment(userMembresiaId: number): Promise<boolean> {
    const paymentCount = await this.pagoRepository
      .createQueryBuilder('pago')
      .where('pago.user_membresia_id = :userMembresiaId', { userMembresiaId })
      .andWhere(
        "DATE_TRUNC('month', pago.created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') = DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')",
      )
      .getCount();

    return paymentCount > 0;
  }

  private async syncMembershipStatusByPayment(userMembresia: UserMembresia): Promise<boolean> {
    const isPaymentUpToDate = await this.hasCurrentMonthPayment(userMembresia.id);

    const expectedStateName = isPaymentUpToDate ? 'AL_DIA' : 'PENDIENTE_PAGO';
    const expectedState = await this.estadoUserMembresiaRepository.findOne({
      where: { nombre: expectedStateName },
    });

    if (!expectedState) {
      throw new NotFoundException(`Estado ${expectedStateName} no encontrado`);
    }

    if (userMembresia.estadoId !== expectedState.id) {
      userMembresia.estadoId = expectedState.id;
      await this.userMembresiaRepository.save(userMembresia);
    }

    return isPaymentUpToDate;
  }

  async findCurrentUserPaymentStatus(userId: number) {
    const memberships = await this.userMembresiaRepository.find({
      where: { userId },
      relations: ['membresia', 'estado'],
      order: { createdAt: 'DESC' },
    });

    if (memberships.length === 0) {
      return { hasEntrenamientoMembership: false, isPaymentUpToDate: null };
    }

    for (const membership of memberships) {
      await this.syncMembershipStatusByPayment(membership);
    }

    const updatedMemberships = await this.userMembresiaRepository.find({
      where: { userId },
      relations: ['membresia', 'estado'],
      order: { createdAt: 'DESC' },
    });

    const isPaymentUpToDate =
      updatedMemberships.length > 0 &&
      updatedMemberships.every((membership) => membership.estado?.nombre === 'AL_DIA');

    const latestMembership = updatedMemberships[0];

    return {
      hasEntrenamientoMembership: true,
      isPaymentUpToDate,
      membresiaName: latestMembership?.membresia?.nombre,
      membresiaId: latestMembership?.membresiaId,
    };
  }

  async findCurrentMonthPaymentsForUser(userId: number) {
    const rawPayments = await this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoin('pago.userMembresia', 'userMembresia')
      .leftJoin('userMembresia.membresia', 'membresiaActual')
      .leftJoin('membresiaActual.tipoMembresia', 'tipoActual')
      .leftJoin('pago.membresia', 'membresiaLegacy')
      .leftJoin('membresiaLegacy.tipoMembresia', 'tipoLegacy')
      .select('pago.id', 'id')
      .addSelect('COALESCE(pago.user_id, userMembresia.user_id)', 'userId')
      .addSelect('pago.user_membresia_id', 'userMembresiaId')
      .addSelect('pago.created_at', 'createdAt')
      .addSelect('COALESCE(membresiaActual.id, membresiaLegacy.id)', 'membresiaId')
      .addSelect("COALESCE(membresiaActual.nombre, membresiaLegacy.nombre, 'Sin membresia')", 'membresiaNombre')
      .addSelect('COALESCE(tipoActual.nombre, tipoLegacy.nombre)', 'tipoMembresiaNombre')
      .addSelect('COALESCE(membresiaActual.costo, membresiaLegacy.costo)', 'costo')
      .where('(pago.user_id = :userId OR userMembresia.user_id = :userId)', { userId })
      .andWhere(
        "DATE_TRUNC('month', pago.created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') = DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')",
      )
      .orderBy('pago.created_at', 'DESC')
      .getRawMany<{
        id: string;
        userId: string | null;
        userMembresiaId: string | null;
        createdAt: string;
        membresiaId: string | null;
        membresiaNombre: string | null;
        tipoMembresiaNombre: string | null;
        costo: string | null;
      }>();

    return rawPayments.map((payment) => {
      const createdAt = new Date(payment.createdAt);

      return {
        id: Number(payment.id),
        userId: payment.userId === null ? null : Number(payment.userId),
        userMembresiaId: payment.userMembresiaId === null ? null : Number(payment.userMembresiaId),
        createdAt,
        mes: createdAt.getMonth() + 1,
        membresiaId: payment.membresiaId === null ? null : Number(payment.membresiaId),
        membresiaNombre: payment.membresiaNombre ?? 'Sin membresia',
        tipoMembresiaNombre: payment.tipoMembresiaNombre ?? null,
        costo: payment.costo === null ? null : Number(payment.costo),
      };
    });
  }

  async findAllPaymentsForUser(userId: number) {
    const rawPayments = await this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoin('pago.userMembresia', 'userMembresia')
      .leftJoin('userMembresia.membresia', 'membresiaActual')
      .leftJoin('membresiaActual.tipoMembresia', 'tipoActual')
      .leftJoin('pago.membresia', 'membresiaLegacy')
      .leftJoin('membresiaLegacy.tipoMembresia', 'tipoLegacy')
      .select('pago.id', 'id')
      .addSelect('COALESCE(pago.user_id, userMembresia.user_id)', 'userId')
      .addSelect('pago.user_membresia_id', 'userMembresiaId')
      .addSelect('pago.created_at', 'createdAt')
      .addSelect('COALESCE(membresiaActual.id, membresiaLegacy.id)', 'membresiaId')
      .addSelect("COALESCE(membresiaActual.nombre, membresiaLegacy.nombre, 'Sin membresia')", 'membresiaNombre')
      .addSelect('COALESCE(tipoActual.nombre, tipoLegacy.nombre)', 'tipoMembresiaNombre')
      .addSelect('COALESCE(membresiaActual.costo, membresiaLegacy.costo)', 'costo')
      .where('(pago.user_id = :userId OR userMembresia.user_id = :userId)', { userId })
      .orderBy('pago.created_at', 'DESC')
      .getRawMany<{
        id: string;
        userId: string | null;
        userMembresiaId: string | null;
        createdAt: string;
        membresiaId: string | null;
        membresiaNombre: string | null;
        tipoMembresiaNombre: string | null;
        costo: string | null;
      }>();

    return rawPayments.map((payment) => {
      const createdAt = new Date(payment.createdAt);

      return {
        id: Number(payment.id),
        userId: payment.userId === null ? null : Number(payment.userId),
        userMembresiaId: payment.userMembresiaId === null ? null : Number(payment.userMembresiaId),
        createdAt,
        mes: createdAt.getMonth() + 1,
        membresiaId: payment.membresiaId === null ? null : Number(payment.membresiaId),
        membresiaNombre: payment.membresiaNombre ?? 'Sin membresia',
        tipoMembresiaNombre: payment.tipoMembresiaNombre ?? null,
        costo: payment.costo === null ? null : Number(payment.costo),
      };
    });
  }

  async findUserCurrentMembership(userId: number) {
    const userMembresship = await this.userMembresiaRepository
      .createQueryBuilder('userMembresia')
      .leftJoinAndSelect('userMembresia.membresia', 'membresia')
      .leftJoinAndSelect('userMembresia.estado', 'estado')
      .where('userMembresia.userId = :userId', { userId })
      .orderBy('userMembresia.createdAt', 'DESC')
      .getOne();

    if (!userMembresship) {
      return null;
    }

    await this.syncMembershipStatusByPayment(userMembresship);

    return this.userMembresiaRepository.findOne({
      where: {
        userId: userMembresship.userId,
        membresiaId: userMembresship.membresiaId,
      },
      relations: ['membresia', 'estado', 'membresia.tipoMembresia'],
    });
  }

  async findUserCurrentMemberships(userId: number) {
    const memberships = await this.userMembresiaRepository.find({
      where: { userId },
      relations: ['membresia', 'estado', 'membresia.tipoMembresia'],
      order: { createdAt: 'DESC' },
    });

    if (memberships.length === 0) {
      return [];
    }

    for (const membership of memberships) {
      await this.syncMembershipStatusByPayment(membership);
    }

    return this.userMembresiaRepository.find({
      where: { userId },
      relations: ['membresia', 'estado', 'membresia.tipoMembresia'],
      order: { createdAt: 'DESC' },
    });
  }

  async assignMembershipToUser(userId: number, membresiaId: number) {
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

    // Get the estado_id for "PENDIENTE_PAGO" (estado_id = 2)
    const estadoPendiente = await this.estadoUserMembresiaRepository.findOne({
      where: { nombre: 'PENDIENTE_PAGO' },
    });

    if (!estadoPendiente) {
      throw new NotFoundException('Estado PENDIENTE_PAGO no encontrado');
    }

    const existingMembership = await this.userMembresiaRepository.findOne({
      where: { userId, membresiaId },
    });

    if (existingMembership) {
      existingMembership.estadoId = estadoPendiente.id;
      return this.userMembresiaRepository.save(existingMembership);
    }

    // Create and save the new user_membresia
    const userMembresia = this.userMembresiaRepository.create({
      userId,
      membresiaId,
      estadoId: estadoPendiente.id,
    });

    return this.userMembresiaRepository.save(userMembresia);
  }
}
