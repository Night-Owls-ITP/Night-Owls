import { IsDateString, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateFacturaDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  numero?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ordenTrabajoId?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
