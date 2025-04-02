import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRequest } from './entities/solicitud.entity';
import { MotivosRechazo } from './entities/motivos.entity';

@Module({
  controllers: [SolicitudController],
  providers: [SolicitudService],
  imports: [TypeOrmModule.forFeature([LoanRequest, MotivosRechazo])],
})
export class SolicitudModule {}
