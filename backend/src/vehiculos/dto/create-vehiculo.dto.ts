import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 10)
  placa!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  marca!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  modelo!: string;

  @IsInt()
  @Min(1900)
  anio!: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  color!: string;
}