import {
  Equals,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateRepuestoDto {
  @IsString()
  @Length(1, 50)
  codigo!: string;

  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsString()
  @Length(1, 500)
  descripcion!: string;

  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  precioVenta!: number;

  @ValidateIf((_dto, value) => value !== undefined)
  @Equals(undefined, {
    message: 'El stock se modifica mediante detalles de compra',
  })
  stock?: never;
}
