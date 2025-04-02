import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CuentaBancoService } from './cuenta-banco.service';
import { CreateBankAccountDto } from './dto/create-cuenta-banco.dto';
import { UpdateBankAccountDto } from './dto/update-cuenta-banco.dto';

@Controller('cuenta-banco')
export class CuentaBancoController {
  constructor(private readonly cuentaBancoService: CuentaBancoService) {}

  @Post()
  create(@Body() dto: CreateBankAccountDto) {
    return this.cuentaBancoService.create(dto);
  }

  @Get()
  findAll() {
    return this.cuentaBancoService.findAll();
  }

  @Get('/by/:userId')
  findOne(@Param('userId') userId: number) {
    return this.cuentaBancoService.findByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateBankAccountDto) {
    return this.cuentaBancoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.cuentaBancoService.remove(id);
  }
}
