import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class UpdateMecanicoDto {
  @ValidateIf((_mecanico, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nombre?: string;

  @ValidateIf((_mecanico, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  documento?: string;

  @ValidateIf((_mecanico, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  telefono?: string;

  @ValidateIf((_mecanico, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  especialidad?: string;

  @ValidateIf((_mecanico, value) => value !== undefined)
  @IsBoolean()
  activo?: boolean;
}
