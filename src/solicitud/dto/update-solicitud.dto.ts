import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Status } from '../interfaces/solicitud-status.interface';

export class UpdateLoanRequestDto {
  @IsOptional()
  @IsString()
  observacion?: string;

  @IsString()
  status: Status;

  @IsNumber()
  userAdminId: number;
}
