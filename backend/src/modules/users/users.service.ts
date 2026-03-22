import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; //Librería para hashear password
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) // Inyecta el repositorio de TypeORM y permite hacer Querys
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //VALIDACIÓN: Verificar si el email ya existe
    const userExists = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (userExists) {
      // Si encuentra un usuario, lanza error 409 (Conflict)
      throw new ConflictException(
        `El email ${createUserDto.email} ya está registrado`
      );
    }

    //HASHEAR PASSWORD: NUNCA guardes contraseña en plano
    //bcrypt genera un hash + salt
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    //El "10" es el número de rondas de hashing (más alto = más seguro pero más lento)

    //CREAR OBJETO USER para guardar en BD
    const newUser = this.userRepository.create({
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      email: createUserDto.email,
      dni: createUserDto.dni,
      password_hash: hashedPassword, // Guardamos el HASH
      role: UserRole.CLIENTE,
      // seguimiento, membresias, planEntrenamiento se inicializan null/vacío automáticamente
    });

    //GUARDAR EN BASE DE DATOS
    const userSaved = await this.userRepository.save(newUser);

    //RESPUESTA: Devolver usuario SIN la password
    // Hacemos un objeto nuevo excluyendo password_hash
    const { password_hash, ...result } = userSaved;
    return result;
    // Ejemplo de lo que devuelve al fronted:
    // {
    //   "id": 1,
    //   "nombre": "Juan",
    //   "apellido": "Pérez",
    //   "email": "juan@gmail.com",
    //   "dni": "12345678",
    //   "role": "CLIENTE"
    // }
  
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    const { password_hash, ...result } = user;
    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
