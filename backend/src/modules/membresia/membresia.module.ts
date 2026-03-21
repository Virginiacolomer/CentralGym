import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiaService } from './membresia.service';
import { MembresiaController } from './membresia.controller';
import { Membresia } from './entities/membresia.entity';
import { Pago } from './entities/pago.entity';
import { TipoMembresia } from './entities/tipoMembresia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membresia, Pago, TipoMembresia])],
  controllers: [MembresiaController],
  providers: [MembresiaService],
  exports: [TypeOrmModule],
})
export class MembresiaModule {}
