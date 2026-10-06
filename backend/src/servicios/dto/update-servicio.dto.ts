import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateServicioDto {
  @ValidateIf((_servicio, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  nombre?: string;

  @ValidateIf((_servicio, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(2, 500)
  descripcion?: string;

  @ValidateIf((_servicio, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  precioBase?: number;

  @ValidateIf((_servicio, value) => value !== undefined)
  @IsBoolean()
  activo?: boolean;
}
