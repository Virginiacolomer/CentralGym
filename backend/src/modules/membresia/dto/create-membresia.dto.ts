import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateMembresiaDto {
	@IsNotEmpty({ message: 'El nombre de la membresia es obligatorio.' })
	@IsString({ message: 'El nombre de la membresia debe ser texto.' })
	nombre: string;

	@Type(() => Number)
	@IsInt({ message: 'Los dias de la membresia deben ser un numero entero.' })
	@Min(1, { message: 'Los dias de la membresia deben ser mayores a 0.' })
	dias: number;

	@Type(() => Number)
	@IsInt({ message: 'El costo de la membresia debe ser un numero entero.' })
	@IsPositive({ message: 'El costo de la membresia debe ser mayor a 0.' })
	costo: number;

	@Type(() => Number)
	@IsInt({ message: 'El tipo de membresia debe ser un numero entero.' })
	@Min(1, { message: 'El tipo de membresia es obligatorio.' })
	tipoMembresiaId: number;
}
