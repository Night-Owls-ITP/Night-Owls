import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @Length(1, 150)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(['administrador', 'recepcionista', 'mecanico'])
  rol?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
