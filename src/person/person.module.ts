import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { PersonRepository } from './repositories/person.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonDocumentoRepository } from './repositories/person-document.repository';
import { PersonAddressRepository } from './repositories/person-address.repository';
import { DocumentGenericRepository } from './repositories/documento.repository';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [
    TypeOrmModule.forFeature([
      PersonRepository,
      PersonDocumentoRepository,
      PersonAddressRepository,
      DocumentGenericRepository,
    ]),
  ],
})
export class PersonModule {}
