import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MembresiaService } from './membresia.service';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';

@Controller('membresia')
export class MembresiaController {
  constructor(private readonly membresiaService: MembresiaService) {}

  @Post()
  create(@Body() createMembresiaDto: CreateMembresiaDto) {
    return this.membresiaService.create(createMembresiaDto);
  }

  @Get()
  findAll() {
    return this.membresiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membresiaService.findOne(+id);
  }

  @Get('pagos/:id')
  findPagoById(@Param('id') id: string) {
    return this.membresiaService.findPagoById(+id);
  }

  @Get('tipos/:id')
  findTipoMembresiaById(@Param('id') id: string) {
    return this.membresiaService.findTipoMembresiaById(+id);
  }

  @Get('estados/:id')
  findEstadoUserMembresiaById(@Param('id') id: string) {
    return this.membresiaService.findEstadoUserMembresiaById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMembresiaDto: UpdateMembresiaDto) {
    return this.membresiaService.update(+id, updateMembresiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membresiaService.remove(+id);
  }
}
