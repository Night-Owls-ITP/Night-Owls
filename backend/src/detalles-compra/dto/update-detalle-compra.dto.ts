import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateDetalleCompraDto {
  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  compraId?: number;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  repuestoId?: number;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  cantidad?: number;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  costoUnitario?: number;
}
