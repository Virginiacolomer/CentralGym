import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserMembresia } from '../membresia/entities/userMembresia.entity';
import { EstadoUserMembresia } from '../membresia/entities/estadoUserMembresia.entity';
import { Membresia } from '../membresia/entities/membresia.entity';
import { Pago } from '../membresia/entities/pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserMembresia, EstadoUserMembresia, Membresia, Pago]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
