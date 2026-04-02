import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { Seguimiento } from './entities/seguimiento.entity';
import { Test, ValorMensual } from './entities/test.entity';
import { unidadMedida } from './entities/unidadMedida.entity';
import { User } from '../users/entities/user.entity';

type TestResumen = {
  id: number;
  nombre: string;
  unidadMedidaId: number | null;
  unidad: string;
  valoresMensuales: ValorMensual[];
};

@Injectable()
export class SeguimientoService {
  constructor(
    @InjectRepository(Seguimiento)
    private readonly seguimientoRepository: Repository<Seguimiento>,
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(unidadMedida)
    private readonly unidadMedidaRepository: Repository<unidadMedida>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createSeguimientoDto: CreateSeguimientoDto) {
    return 'This action adds a new seguimiento';
  }

  findAll() {
    return `This action returns all seguimiento`;
  }

  async findAllUnidadesMedida() {
    return this.unidadMedidaRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findTestsByUserId(userId: number): Promise<TestResumen[]> {
    const seguimiento = await this.findSeguimientoByUserId(userId);

    if (!seguimiento) {
      return [];
    }

    const tests = await this.testRepository.find({
      where: { seguimiento: { id: seguimiento.id } },
      relations: ['unidadMedida'],
      order: { id: 'ASC' },
    });

    return tests.map((test) => this.mapTestResumen(test));
  }

  async createTestForUser(userId: number, payload: { nombre: string; unidadMedidaId: number }) {
    const seguimiento = await this.findSeguimientoByUserId(userId, true);
    if (!seguimiento) {
      throw new NotFoundException('No se pudo crear el seguimiento del usuario.');
    }

    const unidadMedida = await this.unidadMedidaRepository.findOne({
      where: { id: payload.unidadMedidaId },
    });

    if (!unidadMedida) {
      throw new NotFoundException(`No se encontro la unidad de medida con id ${payload.unidadMedidaId}`);
    }

    const test = this.testRepository.create({
      nombre: payload.nombre.trim(),
      valoresMensuales: [],
      unidadMedida,
      seguimiento,
    });

    const saved = await this.testRepository.save(test);
    const created = await this.testRepository.findOne({
      where: { id: saved.id },
      relations: ['unidadMedida'],
    });

    if (!created) {
      throw new NotFoundException('No se pudo recuperar el test creado.');
    }

    return this.mapTestResumen(created);
  }

  async addMonthlyValueToTest(testId: number, payload: { mes: string; valor: number }) {
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['unidadMedida'],
    });

    if (!test) {
      throw new NotFoundException(`No se encontro el test con id ${testId}`);
    }

    const month = String(payload.mes ?? '').trim();
    if (!month) {
      throw new NotFoundException('El mes es obligatorio para registrar el valor.');
    }

    const value = Number(payload.valor);
    if (!Number.isFinite(value)) {
      throw new NotFoundException('El valor mensual debe ser numerico.');
    }

    const currentValues = Array.isArray(test.valoresMensuales) ? [...test.valoresMensuales] : [];
    const existingIndex = currentValues.findIndex((item) => item.mes === month);

    if (existingIndex >= 0) {
      currentValues[existingIndex] = { mes: month, valor: value };
    } else {
      currentValues.push({ mes: month, valor: value });
    }

    test.valoresMensuales = currentValues;
    const saved = await this.testRepository.save(test);
    return this.mapTestResumen(saved);
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

  update(id: number, updateSeguimientoDto: UpdateSeguimientoDto) {
    return `This action updates a #${id} seguimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} seguimiento`;
  }

  private mapTestResumen(test: Test): TestResumen {
    return {
      id: test.id,
      nombre: test.nombre,
      unidadMedidaId: test.unidadMedida?.id ?? null,
      unidad: test.unidadMedida?.nombre ?? '',
      valoresMensuales: Array.isArray(test.valoresMensuales) ? test.valoresMensuales : [],
    };
  }

  private async findSeguimientoByUserId(userId: number, createIfMissing = false): Promise<Seguimiento | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`No se encontro el usuario con id ${userId}`);
    }

    const existing = await this.seguimientoRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (existing) {
      return existing;
    }

    if (!createIfMissing) {
      return null;
    }

    const seguimiento = this.seguimientoRepository.create({
      estado: true,
      user,
    });

    return this.seguimientoRepository.save(seguimiento);
  }
}
