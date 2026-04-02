import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiaService } from './membresia.service';
import { MembresiaController } from './membresia.controller';
import { Membresia } from './entities/membresia.entity';
import { Pago } from './entities/pago.entity';
import { TipoMembresia } from './entities/tipoMembresia.entity';
import { UserMembresia } from './entities/userMembresia.entity';
import { EstadoUserMembresia } from './entities/estadoUserMembresia.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Membresia, Pago, TipoMembresia, UserMembresia, EstadoUserMembresia]), AuthModule],
  controllers: [MembresiaController],
  providers: [MembresiaService],
  exports: [TypeOrmModule],
})
export class MembresiaModule {}
