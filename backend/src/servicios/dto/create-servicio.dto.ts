import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 500)
  descripcion!: string;

  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(99999999.99)
  precioBase!: number;
}
