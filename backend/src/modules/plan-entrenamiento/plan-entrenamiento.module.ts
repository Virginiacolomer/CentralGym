import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { PlanEntrenamientoController } from './plan-entrenamiento.controller';
import { PlanEntrenamiento } from './entities/plan-entrenamiento.entity';
import { Dia } from './entities/dia.entity';
import { Ejercicio } from './entities/ejercicio.entity';
import { EjercicioDia } from './entities/ejercicioDia.entity';
import { GrupoMuscular } from './entities/grupoMuscular.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntrenamiento, Dia, Ejercicio, EjercicioDia, GrupoMuscular])],
  controllers: [PlanEntrenamientoController],
  providers: [PlanEntrenamientoService],
  exports: [TypeOrmModule],
})
export class PlanEntrenamientoModule {}
