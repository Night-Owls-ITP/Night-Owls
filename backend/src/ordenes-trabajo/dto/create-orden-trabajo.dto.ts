import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateOrdenTrabajoDto {
  @IsInt()
  @Min(1)
  vehiculoId!: number;

  @ValidateIf((_orden, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  mecanicoId?: number | null;

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