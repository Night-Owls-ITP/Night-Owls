import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  IsInt,
  Length,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../user-role.enum';

export class UpdateUsuarioDto {
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Length(1, 150)
  nombre?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsEmail()
  email?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @MinLength(8)
  password?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsEnum(UserRole)
  rol?: UserRole;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  activo?: boolean;

  @ValidateIf((_dto, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  mecanicoId?: number | null;
}
