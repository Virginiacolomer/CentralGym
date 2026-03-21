import { Injectable } from '@nestjs/common';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';

@Injectable()
export class PlanEntrenamientoService {
  create(createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    return 'This action adds a new planEntrenamiento';
  }

  findAll() {
    return `This action returns all planEntrenamiento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planEntrenamiento`;
  }

  update(id: number, updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    return `This action updates a #${id} planEntrenamiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} planEntrenamiento`;
  }
}
