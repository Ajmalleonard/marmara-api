import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  userId: string;

  @IsString()
  location: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  returnDate: string;

  @IsString()
  adults: string;

  @IsString()
  @IsOptional()
  children?: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  rooms: string;
}
