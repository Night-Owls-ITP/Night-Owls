import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateDetalleServicioDto {
  @ValidateIf((_detalle, value) => value !== undefined)
  @IsInt()
  @Min(1)
  ordenTrabajoId?: number;

  @ValidateIf((_detalle, value) => value !== undefined)
  @IsInt()
  @Min(1)
  servicioId?: number;

  @ValidateIf((_detalle, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  cantidad?: number;

  @ValidateIf((_detalle, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  precioUnitario?: number;
}
