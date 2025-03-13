import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CreateProvinceArrayDto } from './dto/create-province.dto';
import { Province } from './entities/province.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}
  async create(createCountryDto: CreateCountryDto) {
    return this.countryRepository.save(createCountryDto);
  }

  async createProvince(createProvinceDto: CreateProvinceArrayDto) {
    const province = createProvinceDto.provinces;
    const country = await this.countryRepository.findOne({
      where: { id: createProvinceDto.provinces[0].countryId },
    });
    const provinceCreated = [];
    province.forEach((province) => {
      const provinceEntity = this.provinceRepository.create({
        name: province.name,
        country: country,
      });
      provinceCreated.push(provinceEntity);
    });
    return await this.provinceRepository.save(provinceCreated);
  }

  async findAll() {
    return await this.countryRepository.find();
  }

  async findAllProvince() {
    return await this.provinceRepository.find({ relations: ['country'] });
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return `This action updates a #${id} country`;
  }

  remove(id: number) {
    return `This action removes a #${id} country`;
  }
}
