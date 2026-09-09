import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateOrdenTrabajoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  vehiculoId?: number;

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