import {
  Equals,
  IsDateString,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateCompraDto {
  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  proveedorId?: number;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsDateString()
  fecha?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @Equals(undefined, {
    message: 'El total de la compra lo calcula el servidor',
  })
  total?: never;
}
