import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from './repositories/country.repository';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';

@Module({
  controllers: [CountryController],
  providers: [CountryService, CountryRepository],
  imports: [TypeOrmModule.forFeature([Country, Province])],
})
export class CountryModule {}
