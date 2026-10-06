import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateOrdenTrabajoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  vehiculoId?: number;

  @ValidateIf((_orden, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  mecanicoId?: number | null;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  estado?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}