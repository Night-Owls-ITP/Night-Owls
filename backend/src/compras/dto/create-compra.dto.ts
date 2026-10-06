import {
  Equals,
  IsDateString,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateCompraDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  proveedorId!: number;

  @IsDateString()
  fecha!: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @Equals(undefined, {
    message: 'El total de la compra lo calcula el servidor',
  })
  total?: never;
}
