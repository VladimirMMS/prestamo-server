import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentGeneric } from './entities/documento.entity';
import { PersonAddress } from './entities/person-address.entity';
import { PersonDocumento } from './entities/person-documento.entity';
import { Person } from './entities/person.entity';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [
    TypeOrmModule.forFeature([
      Person,
      PersonDocumento,
      PersonAddress,
      DocumentGeneric,
    ]),
  ],
})
export class PersonModule {}
