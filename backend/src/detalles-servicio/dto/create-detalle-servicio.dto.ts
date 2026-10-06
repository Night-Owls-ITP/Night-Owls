import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class CreateDetalleServicioDto {
  @IsInt()
  @Min(1)
  ordenTrabajoId!: number;

  @IsInt()
  @Min(1)
  servicioId!: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  cantidad!: number;

  @ValidateIf((_detalle, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  precioUnitario?: number;
}
