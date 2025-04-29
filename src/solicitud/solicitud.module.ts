import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRequest } from './entities/solicitud.entity';
import { MotivosRechazo } from './entities/motivos.entity';
import { PrestamoModule } from 'src/prestamo/prestamo.module';
import { LoanRequestUser } from './entities/solicitud-usuario.entity';
import { Loan } from 'src/prestamo/entities/prestamo.entity';
import { PaymentHistory } from 'src/prestamo/entities/historial.entity';

@Module({
  controllers: [SolicitudController],
  providers: [SolicitudService],
  imports: [
    TypeOrmModule.forFeature([
      LoanRequest,
      MotivosRechazo,
      LoanRequestUser,
      Loan,
      PaymentHistory,
    ]),
    PrestamoModule,
  ],
  exports: [SolicitudService],
})
export class SolicitudModule {}
