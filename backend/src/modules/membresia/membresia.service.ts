import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { Membresia } from './entities/membresia.entity';
import { Pago } from './entities/pago.entity';
import { TipoMembresia } from './entities/tipoMembresia.entity';
import { EstadoUserMembresia } from './entities/estadoUserMembresia.entity';

@Injectable()
export class MembresiaService {
  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepository: Repository<Membresia>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(TipoMembresia)
    private readonly tipoMembresiaRepository: Repository<TipoMembresia>,
    @InjectRepository(EstadoUserMembresia)
    private readonly estadoUserMembresiaRepository: Repository<EstadoUserMembresia>,
  ) {}

  create(createMembresiaDto: CreateMembresiaDto) {
    return 'This action adds a new membresia';
  }

  findAll() {
    return `This action returns all membresia`;
  }

  async findOne(id: number) {
    return this.findMembresiaById(id);
  }

  async findMembresiaById(id: number) {
    const membresia = await this.membresiaRepository.findOne({ where: { id } });

    if (!membresia) {
      throw new NotFoundException(`No se encontro la membresia con id ${id}`);
    }

    return membresia;
  }

  async findPagoById(id: number) {
    const pago = await this.pagoRepository.findOne({ where: { id } });

    if (!pago) {
      throw new NotFoundException(`No se encontro el pago con id ${id}`);
    }

    return pago;
  }

  async findTipoMembresiaById(id: number) {
    const tipoMembresia = await this.tipoMembresiaRepository.findOne({ where: { id } });

    if (!tipoMembresia) {
      throw new NotFoundException(`No se encontro el tipo de membresia con id ${id}`);
    }

    return tipoMembresia;
  }

  async findEstadoUserMembresiaById(id: number) {
    const estado = await this.estadoUserMembresiaRepository.findOne({ where: { id } });

    if (!estado) {
      throw new NotFoundException(`No se encontro el estado de membresia con id ${id}`);
    }

    return estado;
  }

  update(id: number, updateMembresiaDto: UpdateMembresiaDto) {
    return `This action updates a #${id} membresia`;
  }

  remove(id: number) {
    return `This action removes a #${id} membresia`;
  }
}
