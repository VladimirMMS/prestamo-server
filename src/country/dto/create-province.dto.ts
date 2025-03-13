import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class CreateProvinceDto {
  @IsString()
  name: string;

  @IsNumber()
  countryId: number;
}

export class CreateProvinceArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProvinceDto)
  provinces: CreateProvinceDto[];
}
