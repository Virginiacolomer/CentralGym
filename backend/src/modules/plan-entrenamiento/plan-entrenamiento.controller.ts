import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('plan-entrenamiento')
export class PlanEntrenamientoController {
  constructor(private readonly planEntrenamientoService: PlanEntrenamientoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.create(createPlanEntrenamientoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('ejercicios')
  createEjercicio(@Body() createEjercicioDto: CreateEjercicioDto) {
    return this.planEntrenamientoService.createEjercicio(createEjercicioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.planEntrenamientoService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mio')
  async findMine(@Req() request: { user: { sub: number } }) {
    const assignment = await this.planEntrenamientoService.findAssignmentByUserId(request.user.sub);
    const plan = await this.planEntrenamientoService.findByUserId(request.user.sub);

    return {
      userId: request.user.sub,
      planEntrenamientoId: assignment?.planEntrenamientoId ?? null,
      plan,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('usuario/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const plan = await this.planEntrenamientoService.findByUserId(+userId);
    return { plan };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('ejercicios/:id')
  findEjercicioById(@Param('id') id: string) {
    return this.planEntrenamientoService.findEjercicioById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('grupos-musculares/:id')
  findGrupoMuscularById(@Param('id') id: string) {
    return this.planEntrenamientoService.findGrupoMuscularById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('grupos-musculares')
  findGruposMusculares() {
    return this.planEntrenamientoService.findGruposMusculares();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planEntrenamientoService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('usuario/:userId/asignar/:planId')
  assignPlanToUser(
    @Param('userId') userId: string,
    @Param('planId') planId: string,
  ) {
    return this.planEntrenamientoService.assignPlanToUser(+userId, +planId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('usuario/:userId/editar')
  updatePlanForUser(
    @Param('userId') userId: string,
    @Body() createPlanEntrenamientoDto: CreatePlanEntrenamientoDto,
  ) {
    return this.planEntrenamientoService.updatePlanForUser(+userId, createPlanEntrenamientoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    return this.planEntrenamientoService.update(+id, updatePlanEntrenamientoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planEntrenamientoService.remove(+id);
  }
}
