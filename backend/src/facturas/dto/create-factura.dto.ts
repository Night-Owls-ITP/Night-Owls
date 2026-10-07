import { IsDateString, IsInt, IsString, Length, Min } from 'class-validator';

export class CreateFacturaDto {
  @IsString()
  @Length(1, 50)
  numero!: string;

  @IsInt()
  @Min(1)
  ordenTrabajoId!: number;

  @IsDateString()
  fecha!: string;
}
