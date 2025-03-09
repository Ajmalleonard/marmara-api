import { IsString, IsNotEmpty } from 'class-validator';

export class ReplacePhotoDto {
  @IsString()
  @IsNotEmpty()
  oldUrl: string;

  @IsString()
  @IsNotEmpty()
  newUrl: string;
}
