import { IsString, Length } from 'class-validator';

export class UpdateBankAccountDto {
  @IsString()
  @Length(5, 50)
  accountNumber?: string;

  @IsString()
  @Length(3, 100)
  bankName?: string;
}
