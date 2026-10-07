import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDetalleRepuestoDto {
  @IsInt()
  @Min(1)
  ordenTrabajoId!: number;

  @IsInt()
  @Min(1)
  repuestoId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  precioUnitario?: number;
}
