import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateOrdenTrabajoDto {
  @IsInt()
  @Min(1)
  vehiculoId!: number;

  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  estado!: string;

  @IsInt()
  @Min(0)
  costo!: number;

  @IsDateString()
  fecha!: string;
}