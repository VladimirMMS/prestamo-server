import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PaymentDto } from './dto/payment.dto';
import { InteresDto } from './dto/interest.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('prestamo')
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post('/payment/create')
  @UseGuards(AuthGuard())
  create(@Body() paymentDto: PaymentDto) {
    return this.prestamoService.addPayment(paymentDto);
  }

  @Get('/dashboard/stats/:userId')
  @UseGuards(AuthGuard())
  findStatsDashboard(@Param('userId') userId: string) {
    return this.prestamoService.findStatsDashboard(+userId);
  }

  @Get('/by-usuario/:userId')
  @UseGuards(AuthGuard())
  findPrestamos(@Param('userId') userId: string) {
    return this.prestamoService.findPrestamos(+userId);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePrestamoDto: UpdatePrestamoDto,
  // ) {
  //   return this.prestamoService.update(+id, updatePrestamoDto);
  // }

  @Get('histotial/:prestamoId')
  @UseGuards(AuthGuard('jwt'))
  findHistorial(@Param('prestamoId', ParseIntPipe) prestamoId: number) {
    return this.prestamoService.findHisorialPrestamo(prestamoId);
  }

  @Get('dashboard/superuser')
  @UseGuards(AuthGuard('jwt'))
  getStatsSuperUser() {
    return this.prestamoService.obtenerNumberSolicitudes();
  }

  @Get('general')
  @UseGuards(AuthGuard('jwt'))
  findPrestamosGeneral() {
    return this.prestamoService.findPrestamosGeneral();
  }

  @Get('interest')
  @UseGuards(AuthGuard('jwt'))
  findInterests() {
    return this.prestamoService.findInterests();
  }

  @Post('interest')
  @UseGuards(AuthGuard('jwt'))
  createInterest(@Body() body: InteresDto) {
    return this.prestamoService.createInterest(body);
  }

  @Get('interest/:userId')
  @UseGuards(AuthGuard('jwt'))
  findInterestsByUserId(@Param('userId') userId: string) {
    return this.prestamoService.findInterestByUserId(+userId);
  }

  @Patch('interest/:id')
  @UseGuards(AuthGuard('jwt'))
  updateInterest(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.prestamoService.updateInterest(id, body);
  }
}
