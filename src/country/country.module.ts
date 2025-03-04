import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from './repositories/country.repository';
import { ProvinceRepository } from './repositories/province.repository';

@Module({
  controllers: [CountryController],
  providers: [CountryService],
  imports: [TypeOrmModule.forFeature([CountryRepository, ProvinceRepository])],
})
export class CountryModule {}
