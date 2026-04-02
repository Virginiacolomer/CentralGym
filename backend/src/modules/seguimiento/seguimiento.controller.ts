import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('seguimiento')
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSeguimientoDto: CreateSeguimientoDto) {
    return this.seguimientoService.create(createSeguimientoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get()
  findAll() {
    return this.seguimientoService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('unidades-medida')
  findAllUnidadesMedida() {
    return this.seguimientoService.findAllUnidadesMedida();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('usuario/:userId/tests')
  findTestsByUserId(@Param('userId') userId: string) {
    return this.seguimientoService.findTestsByUserId(+userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('usuario/:userId/tests')
  createTestForUser(
    @Param('userId') userId: string,
    @Body() body: { nombre: string; unidadMedidaId: number },
  ) {
    return this.seguimientoService.createTestForUser(+userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('tests/:testId/valores')
  addMonthlyValueToTest(
    @Param('testId') testId: string,
    @Body() body: { mes: string; valor: number },
  ) {
    return this.seguimientoService.addMonthlyValueToTest(+testId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('tests/:id')
  findTestById(@Param('id') id: string) {
    return this.seguimientoService.findTestById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('unidades-medida/:id')
  findUnidadMedidaById(@Param('id') id: string) {
    return this.seguimientoService.findUnidadMedidaById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seguimientoService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeguimientoDto: UpdateSeguimientoDto) {
    return this.seguimientoService.update(+id, updateSeguimientoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seguimientoService.remove(+id);
  }
}
