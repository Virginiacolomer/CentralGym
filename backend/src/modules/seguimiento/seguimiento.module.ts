import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguimientoService } from './seguimiento.service';
import { SeguimientoController } from './seguimiento.controller';
import { Seguimiento } from './entities/seguimiento.entity';
import { Test } from './entities/test.entity';
import { unidadMedida } from './entities/unidadMedida.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seguimiento, Test, unidadMedida, User]), AuthModule],
  controllers: [SeguimientoController],
  providers: [SeguimientoService],
  exports: [TypeOrmModule],
})
export class SeguimientoModule {}
