import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateDetalleRepuestoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  ordenTrabajoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  repuestoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  precioUnitario?: number;
}
