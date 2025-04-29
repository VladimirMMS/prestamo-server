import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/prestamo.entity';
import { User } from 'src/user/entities/user.entity';
import { LoanRequest } from 'src/solicitud/entities/solicitud.entity';
import { PaymentHistory } from './entities/historial.entity';
import { Interest } from './entities/Interes.entity';
import { DocumentGeneric } from 'src/person/entities/documento.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PrestamoController],
  providers: [PrestamoService],
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      User,
      LoanRequest,
      PaymentHistory,
      Interest,
      DocumentGeneric,
    ]),
    AuthModule,
  ],
  exports: [PrestamoService],
})
export class PrestamoModule {}
