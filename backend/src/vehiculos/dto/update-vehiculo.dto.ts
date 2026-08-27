import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateVehiculoDto {
  @IsOptional()
  @IsString()
  @Length(6, 10)
  placa?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  marca?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  modelo?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anio?: number;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  color?: string;
}