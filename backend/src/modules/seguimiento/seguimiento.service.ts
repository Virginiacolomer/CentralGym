import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { Seguimiento } from './entities/seguimiento.entity';
import { Test } from './entities/test.entity';
import { unidadMedida } from './entities/unidadMedida.entity';
import { Valor } from './entities/valor.entity';

@Injectable()
export class SeguimientoService {
  constructor(
    @InjectRepository(Seguimiento)
    private readonly seguimientoRepository: Repository<Seguimiento>,
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(unidadMedida)
    private readonly unidadMedidaRepository: Repository<unidadMedida>,
    @InjectRepository(Valor)
    private readonly valorRepository: Repository<Valor>,
  ) {}

  create(createSeguimientoDto: CreateSeguimientoDto) {
    return 'This action adds a new seguimiento';
  }

  findAll() {
    return `This action returns all seguimiento`;
  }

  async findOne(id: number) {
    return this.findSeguimientoById(id);
  }

  async findSeguimientoById(id: number) {
    const seguimiento = await this.seguimientoRepository.findOne({ where: { id } });

    if (!seguimiento) {
      throw new NotFoundException(`No se encontro el seguimiento con id ${id}`);
    }

    return seguimiento;
  }

  async findTestById(id: number) {
    const test = await this.testRepository.findOne({ where: { id } });

    if (!test) {
      throw new NotFoundException(`No se encontro el test con id ${id}`);
    }

    return test;
  }

  async findUnidadMedidaById(id: number) {
    const unidadMedida = await this.unidadMedidaRepository.findOne({ where: { id } });

    if (!unidadMedida) {
      throw new NotFoundException(`No se encontro la unidad de medida con id ${id}`);
    }

    return unidadMedida;
  }

  async findValorById(id: number) {
    const valor = await this.valorRepository.findOne({ where: { id } });

    if (!valor) {
      throw new NotFoundException(`No se encontro el valor con id ${id}`);
    }

    return valor;
  }

  update(id: number, updateSeguimientoDto: UpdateSeguimientoDto) {
    return `This action updates a #${id} seguimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} seguimiento`;
  }
}
