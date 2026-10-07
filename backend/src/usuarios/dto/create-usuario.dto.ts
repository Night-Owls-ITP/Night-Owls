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

export class CreateUsuarioDto {
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  rol!: UserRole;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  activo?: boolean;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsInt()
  @Min(1)
  mecanicoId?: number;
}
