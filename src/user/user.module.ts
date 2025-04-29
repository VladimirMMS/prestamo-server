import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Person } from 'src/person/entities/person.entity';
import { Country } from 'src/country/entities/country.entity';
import { Province } from 'src/country/entities/province.entity';
import { PersonAddress } from 'src/person/entities/person-address.entity';
import { DocumentGeneric } from 'src/person/entities/documento.entity';
import { PersonDocumento } from 'src/person/entities/person-documento.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Person,
      Country,
      Province,
      PersonAddress,
      DocumentGeneric,
      PersonDocumento,
    ]),
  ],
})
export class UserModule {}
