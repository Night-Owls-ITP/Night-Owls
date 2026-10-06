import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateDetalleCompraDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  compraId!: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  repuestoId!: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  costoUnitario!: number;
}
