import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateMembresiaDto {
	@IsNotEmpty({ message: 'El nombre de la membresia es obligatorio.' })
	@IsString({ message: 'El nombre de la membresia debe ser texto.' })
	nombre: string;

	@IsOptional()
	@IsString({ message: 'La descripcion de la membresia debe ser texto.' })
	@MaxLength(500, { message: 'La descripcion de la membresia no puede superar los 500 caracteres.' })
	descripcion?: string;

	@IsNotEmpty({ message: 'La frecuencia de la membresia es obligatoria.' })
	@IsString({ message: 'La frecuencia de la membresia debe ser texto.' })
	@MaxLength(100, { message: 'La frecuencia de la membresia no puede superar los 100 caracteres.' })
	dias: string;

	@Type(() => Number)
	@IsInt({ message: 'El costo de la membresia debe ser un numero entero.' })
	@IsPositive({ message: 'El costo de la membresia debe ser mayor a 0.' })
	costo: number;

	@Type(() => Number)
	@IsInt({ message: 'El tipo de membresia debe ser un numero entero.' })
	@Min(1, { message: 'El tipo de membresia es obligatorio.' })
	tipoMembresiaId: number;
}
