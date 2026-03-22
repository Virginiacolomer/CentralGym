import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';
import { PlanEntrenamiento } from './entities/plan-entrenamiento.entity';
import { Dia } from './entities/dia.entity';
import { Ejercicio } from './entities/ejercicio.entity';
import { EjercicioDia } from './entities/ejercicioDia.entity';
import { GrupoMuscular } from './entities/grupoMuscular.entity';

@Injectable()
export class PlanEntrenamientoService {
  constructor(
    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>,
    @InjectRepository(Dia)
    private readonly diaRepository: Repository<Dia>,
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(EjercicioDia)
    private readonly ejercicioDiaRepository: Repository<EjercicioDia>,
    @InjectRepository(GrupoMuscular)
    private readonly grupoMuscularRepository: Repository<GrupoMuscular>,
  ) {}

  create(createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    return 'This action adds a new planEntrenamiento';
  }

  findAll() {
    return `This action returns all planEntrenamiento`;
  }

  async findOne(id: number) {
    return this.findPlanEntrenamientoById(id);
  }

  async findPlanEntrenamientoById(id: number) {
    const plan = await this.planEntrenamientoRepository.findOne({ where: { id } });

    if (!plan) {
      throw new NotFoundException(`No se encontro el plan de entrenamiento con id ${id}`);
    }

    return plan;
  }

  async findDiaById(id: number) {
    const dia = await this.diaRepository.findOne({ where: { id } });

    if (!dia) {
      throw new NotFoundException(`No se encontro el dia con id ${id}`);
    }

    return dia;
  }

  async findEjercicioById(id: number) {
    const ejercicio = await this.ejercicioRepository.findOne({ where: { id } });

    if (!ejercicio) {
      throw new NotFoundException(`No se encontro el ejercicio con id ${id}`);
    }

    return ejercicio;
  }

  async findEjercicioDiaById(id: number) {
    const ejercicioDia = await this.ejercicioDiaRepository.findOne({ where: { id } });

    if (!ejercicioDia) {
      throw new NotFoundException(`No se encontro el ejercicioDia con id ${id}`);
    }

    return ejercicioDia;
  }

  async findGrupoMuscularById(id: number) {
    const grupoMuscular = await this.grupoMuscularRepository.findOne({ where: { id } });

    if (!grupoMuscular) {
      throw new NotFoundException(`No se encontro el grupo muscular con id ${id}`);
    }

    return grupoMuscular;
  }

  update(id: number, updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    return `This action updates a #${id} planEntrenamiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} planEntrenamiento`;
  }
}
