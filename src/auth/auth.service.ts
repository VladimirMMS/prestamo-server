import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/sign-up.dto';
import { Multer } from 'multer';

import { User } from 'src/user/entities/user.entity';
import { Person } from 'src/person/entities/person.entity';
import { Country } from 'src/country/entities/country.entity';
import { Province } from 'src/country/entities/province.entity';
import { PersonAddress } from 'src/person/entities/person-address.entity';
import { DocumentGeneric } from 'src/person/entities/documento.entity';
import { PersonDocumento } from 'src/person/entities/person-documento.entity';
import { DocumentTypeEnum } from 'src/person/interfaces/tipo-documento.interface';
import { ValidRoles } from './interfaces/valid-roles';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
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

    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto, file: Multer.File) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.correo },
    });

    const existingPerson = await this.personRepository.findOne({
      where: { cedula: signupDto.cedula },
    });

    if (existingPerson) {
      throw new BadRequestException('La cedula ya está en uso');
    }

    if (existingUser) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const province = await this.findProvince(signupDto.provinciaId);

    const hashedPassword = await this.hashPassword(signupDto.contrasena);

    const secureUrl = this.generateFileUrl(file.filename);

    const newPerson = await this.createPerson(signupDto, province, secureUrl);
    const newUser = await this.createUser(
      signupDto.correo,
      hashedPassword,
      newPerson,
    );

    return {
      message: 'Usuario registrado exitosamente',
      user: { id: newUser.id, correo: newUser.email },
    };
  }

  private async findProvince(provinceId: number): Promise<Province> {
    const province = await this.provinceRepository.findOne({
      where: { id: provinceId },
    });
    if (!province) throw new BadRequestException('Provincia no encontrada');
    return province;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private generateFileUrl(filename: string): string {
    return `http://localhost:3000/uploads/${filename}`;
  }

  private async createPerson(
    signupDto: SignupDto,
    province: Province,
    fileUrl: string,
  ): Promise<Person> {
    const { nombre, apellido, cedula, fechaNacimiento, direccion } = signupDto;

    let newPersonAddress = this.personAddressRepository.create({
      address: direccion,
      province,
    });

    newPersonAddress = await this.personAddressRepository.save(
      newPersonAddress,
    );
    let documento = this.documentGenericRepository.create({
      extension: 'pdf',
      tipo: 1,
      createdAt: new Date(),
      route: fileUrl,
      name: 'documento',
    });
    documento = await this.documentGenericRepository.save(documento);

    let newPersonDocumento = this.personDocumentoRepository.create({
      document: documento,
      documentType:
        signupDto.tipoDocumento === 'cedula'
          ? DocumentTypeEnum.CEDULA
          : DocumentTypeEnum.PASAPORTE,
    });

    newPersonDocumento = await this.personDocumentoRepository.save(
      newPersonDocumento,
    );

    const newPerson = this.personRepository.create({
      names: nombre,
      lastNames: apellido,
      cedula,
      createdAt: new Date(),
      updatedAt: new Date(),
      fechaNacimiento: new Date(fechaNacimiento),
      personAddress: newPersonAddress,
      personDocument: [newPersonDocumento],
      telefono: signupDto.telefono,
    });

    await this.personRepository.save(newPerson);
    return newPerson;
  }

  private async createUser(
    email: string,
    password: string,
    person: Person,
  ): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      password,
      person,
      isActive: false,
      role: ValidRoles.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        role: true,
        profileImage: true,
      },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    delete user.password;
    return {
      ...user,
      token: this.getJwt({ id: user.id }),
    };
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async changeProfile(
    userId: number,
    files: {
      profilePic?: Multer.File;
      idDocument?: Multer.File;
    },
  ) {
    const { profilePic, idDocument } = files;

    if (!profilePic || !idDocument) {
      throw new BadRequestException('Faltan archivos adjuntos');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'person',
        'person.personDocument',
        'person.personDocument.document',
      ],
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const personDoc = user.person?.personDocument?.[0];
    if (!personDoc) {
      throw new BadRequestException(
        'El usuario no tiene documentos registrados',
      );
    }

    const profilePicUrl = this.generateFileUrl(profilePic.filename);
    const idDocumentUrl = this.generateFileUrl(idDocument.filename);

    user.profileImage = profilePicUrl;
    personDoc.document.route = idDocumentUrl;

    await this.userRepository.save(user);
    await this.personDocumentoRepository.save(personDoc);
    await this.documentGenericRepository.save(personDoc.document);

    return {
      message: 'Perfil actualizado exitosamente',
      user,
    };
  }

  async checkAuthStatus(user: User) {
    if (user.id) {
      return {
        ...user,
        token: this.getJwt({ id: user.id }),
      };
    }
  }
}
