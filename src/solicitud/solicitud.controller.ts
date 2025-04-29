import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { CreateLoanRequestDto } from './dto/create-solicitud.dto';
import { UpdateLoanRequestDto } from './dto/update-solicitud.dto';

@Controller('solicitud')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  create(@Body() createSolicitudDto: CreateLoanRequestDto) {
    return this.solicitudService.createLoanRequest(createSolicitudDto);
  }

  @Patch('enviar/solicitud/:id')
  enviarSolicitud(@Param('id') id: string) {
    return this.solicitudService.enviarSolicitud(+id);
  }

  @Get('loan/pending')
  findAll() {
    return this.solicitudService.getLoansPeding();
  }

  @Get('/por-usuario/:id')
  findOne(@Param('id') id: string) {
    return this.solicitudService.findSolicitudesPrestamos(+id);
  }

  @Patch('gestionar/solicitudes-pendientes/:id')
  update(
    @Param('id') id: string,
    @Body() updateSolicitudDto: UpdateLoanRequestDto,
  ) {
    return this.solicitudService.updateLoanRequest(+id, updateSolicitudDto);
  }
}
