import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

export class CreateUserDto {
  @IsString()
  role: ValidRoles;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  identification: string;

  @IsNumber()
  id: number;
}
