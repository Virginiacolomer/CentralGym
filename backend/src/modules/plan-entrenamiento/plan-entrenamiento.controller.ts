import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';

@Controller('plan-entrenamiento')
export class PlanEntrenamientoController {
  constructor(private readonly planEntrenamientoService: PlanEntrenamientoService) {}

  @Post()
  create(@Body() createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.create(createPlanEntrenamientoDto);
  }

  @Get()
  findAll() {
    return this.planEntrenamientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planEntrenamientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.update(+id, updatePlanEntrenamientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planEntrenamientoService.remove(+id);
  }
}
