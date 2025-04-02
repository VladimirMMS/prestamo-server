import { Module } from '@nestjs/common';
import { CuentaBancoService } from './cuenta-banco.service';
import { CuentaBancoController } from './cuenta-banco.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { BankAccount } from './entities/cuenta-banco.entity';

@Module({
  controllers: [CuentaBancoController],
  providers: [CuentaBancoService],
  imports: [TypeOrmModule.forFeature([User, BankAccount])],
})
export class CuentaBancoModule {}
