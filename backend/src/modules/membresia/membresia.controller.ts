import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MembresiaService } from './membresia.service';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('membresia')
export class MembresiaController {
  constructor(private readonly membresiaService: MembresiaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createMembresiaDto: CreateMembresiaDto) {
    return this.membresiaService.create(createMembresiaDto);
  }

  @Get()
  findAll() {
    return this.membresiaService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('tipos')
  findAllTiposMembresia() {
    return this.membresiaService.findAllTiposMembresia();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mi-estado')
  async findMyPaymentStatus(@Req() request: { user: { sub: number } }) {
    return this.membresiaService.findCurrentUserPaymentStatus(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mi-membresia')
  async getMyMembership(@Req() request: { user: { sub: number } }) {
    return this.membresiaService.findUserCurrentMembership(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mis-membresias')
  async getMyMemberships(@Req() request: { user: { sub: number } }) {
    return this.membresiaService.findUserCurrentMemberships(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mis-pagos/mes-actual')
  async getMyCurrentMonthPayments(@Req() request: { user: { sub: number } }) {
    return this.membresiaService.findCurrentMonthPaymentsForUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Get('mis-pagos')
  async getMyPayments(@Req() request: { user: { sub: number } }) {
    return this.membresiaService.findAllPaymentsForUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENTE)
  @Post('asignar')
  async assignMembership(@Req() request: { user: { sub: number } }, @Body() body: { membresiaId: number }) {
    return this.membresiaService.assignMembershipToUser(request.user.sub, body.membresiaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membresiaService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  @Get('pagos/:id')
  findPagoById(@Param('id') id: string) {
    return this.membresiaService.findPagoById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('tipos/:id')
  findTipoMembresiaById(@Param('id') id: string) {
    return this.membresiaService.findTipoMembresiaById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('estados/:id')
  findEstadoUserMembresiaById(@Param('id') id: string) {
    return this.membresiaService.findEstadoUserMembresiaById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMembresiaDto: UpdateMembresiaDto) {
    return this.membresiaService.update(+id, updateMembresiaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membresiaService.remove(+id);
  }
}
