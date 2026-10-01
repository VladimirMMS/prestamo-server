import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonDocumento } from 'src/person/entities/person-documento.entity';
import { DocumentGeneric } from 'src/person/entities/documento.entity';
import { User } from './entities/user.entity';
import { Person } from 'src/person/entities/person.entity';
import { Country } from 'src/country/entities/country.entity';
import { Province } from 'src/country/entities/province.entity';
import { PersonAddress } from 'src/person/entities/person-address.entity';
import { Repository } from 'typeorm';
import { DocumentTypeEnum } from 'src/person/interfaces/tipo-documento.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Person)
    private personRepository: Repository<Person>,

    @InjectRepository(Country)
    private countryRepository: Repository<Country>,

    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,

    @InjectRepository(PersonAddress)
    private personAddressRepository: Repository<PersonAddress>,

    @InjectRepository(DocumentGeneric)
    private documentGenericRepository: Repository<DocumentGeneric>,

    @InjectRepository(PersonDocumento)
    private personDocumentoRepository: Repository<PersonDocumento>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: {
        person: true,
      },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.person.names,
      email: user.email,
      identification: user.person.cedula,
      role: user.role,
      isActive: user.isActive,
    }));
  }

  async findOne(id: number) {
    // Validate input
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid user ID');
    }

    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
          person: {
            personDocument: {
              documentType: DocumentTypeEnum.CEDULA,
            },
          },
        },
        relations: {
          person: {
            personDocument: {
              document: true,
            },
            personAddress: {
              province: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }
      const cedulaDocument = user.person.personDocument.find(
        (doc) => doc.documentType === DocumentTypeEnum.CEDULA,
      );

      if (!cedulaDocument) {
        throw new Error('Cédula document not found for user');
      }

      return {
        id: user.id,
        firstName: user.person.names,
        lastName: user.person.lastNames,
        email: user.email,
        cedula: user.person.cedula,
        cedulaPhoto: cedulaDocument.document?.route || null,
        profilePhoto: user.profileImage || null,
      };
    } catch (error) {
      console.error(`Error finding user with ID ${id}:`, error);
      throw new Error('Failed to retrieve user information');
    }
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
