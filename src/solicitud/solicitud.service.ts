import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLoanRequestDto } from './dto/create-solicitud.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoanRequest } from './entities/solicitud.entity';
import { Repository } from 'typeorm';
import { Status } from './interfaces/solicitud-status.interface';
import { UpdateLoanRequestDto } from './dto/update-solicitud.dto';
import { MotivosRechazo } from './entities/motivos.entity';
import { PrestamoService } from 'src/prestamo/prestamo.service';
import { LoanRequestUser } from './entities/solicitud-usuario.entity';
import { Loan } from 'src/prestamo/entities/prestamo.entity';
import { PaymentHistory } from 'src/prestamo/entities/historial.entity';
import Stripe from 'stripe';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(LoanRequest)
    private readonly loanRequestRepository: Repository<LoanRequest>,

    @InjectRepository(MotivosRechazo)
    private readonly motivosRechazoRepository: Repository<MotivosRechazo>,

    private readonly prestamoService: PrestamoService,

    @InjectRepository(LoanRequestUser)
    private readonly loanRequestUserRepository: Repository<LoanRequestUser>,

    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @InjectRepository(PaymentHistory)
    private readonly paymentRepository: Repository<PaymentHistory>,
  ) {}

  async createLoanRequest(payload: CreateLoanRequestDto): Promise<LoanRequest> {
    try {
      if (payload.id) {
        // Editar solicitud existente
        const existing = await this.loanRequestRepository.findOne({
          where: { id: payload.id },
        });

        if (!existing) {
          throw new BadRequestException('La solicitud no existe.');
        }

        const updated = this.loanRequestRepository.merge(existing, {
          amountRequested: payload.amountRequested,
          termInMonths: payload.termInMonths,
          paymentFrequency: payload.paymentFrequency,
          totalLoanAmount: payload.totalLoanAmount,
          installments: payload.installments,
          installmentAmount: payload.installmentAmount,
          interestRate: payload.interestRate,
          bankAccount: { id: payload.bankAccountId },
          status: Status.Pendiente,
        });

        return await this.loanRequestRepository.save(updated);
      }

      const existingRequest = await this.loanRequestRepository.findOne({
        where: { user: { id: payload.userId }, status: Status.Pendiente },
      });

      if (existingRequest) {
        throw new BadRequestException(
          'El usuario ya tiene una solicitud pendiente.',
        );
      }

      const loanRequest = this.loanRequestRepository.create({
        ...payload,
        user: { id: payload.userId },
        bankAccount: { id: payload.bankAccountId },
        loanRequestUser: null,
        status: Status.Pendiente,
      });

      return await this.loanRequestRepository.save(loanRequest);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear la solicitud');
    }
  }

  async findSolicitudesPrestamos(userId: number) {
    if (userId) {
      const loans = await this.loanRequestRepository.find({
        where: { user: { id: userId } },
        relations: ['bankAccount', 'motivos'],
      });
      const loansAdapted = loans.map((loan) => {
        const motivos = loan?.motivos?.sort((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        return {
          id: loan.id,
          monto: loan.amountRequested,
          plazos: loan.installments,
          frecuencia: loan.paymentFrequency,
          estado: loan.status,
          cuenta: loan.bankAccount.accountNumber,
          fecha: loan.createdAt,
          tasa: loan.interestRate,
          cuotas: loan.installmentAmount,
          motivoRechazo: motivos[0]?.description || '',
        };
      });
      return loansAdapted;
    }
    return [];
  }

  async getLoansPeding() {
    try {
      const loans = await this.loanRequestRepository.find({
        where: { status: Status.Pendiente },
        relations: [
          'user',
          'user.person',
          'user.person.personDocument',
          'user.person.personDocument.document',
          'bankAccount',
        ],
      });
      const mappedLoans = loans.map((loan) => {
        const { user, bankAccount } = loan;
        const { person } = user;

        return {
          id: loan.id,
          amount: loan.amountRequested,
          term: loan.termInMonths,
          status: loan.status,
          interestRate: loan.interestRate,
          installmentAmount: loan.installmentAmount,
          createdAt: loan.createdAt,

          // Información personal del usuario
          names: person.names,
          lastNames: person.lastNames,
          fullName: `${person.names} ${person.lastNames}`,
          cedula: person.cedula,
          birthDate: person.fechaNacimiento,
          address: person.personAddress,
          email: user.email,

          // Documentos
          documents: person.personDocument.map((doc) => ({
            type: doc.documentType,
            url: doc.document.route,
            name: doc.document.name,
            extension: doc.document.extension,
          })),

          // Información bancaria
          bankAccount: {
            number: bankAccount.accountNumber,
            bank: bankAccount.bankName,
            type: bankAccount.accountType || 'No especificado',
          },
        };
      });
      return mappedLoans;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al obtener los prestamos pendientes',
      );
    }
  }
  async updateLoanRequest(id: number, updateLoanRequest: UpdateLoanRequestDto) {
    try {
      const loanRequest = await this.loanRequestRepository.findOne({
        where: { id },
        relations: ['user', 'bankAccount', 'motivos'],
      });

      if (!loanRequest) {
        throw new BadRequestException('Préstamo no encontrado');
      }

      let loanRquestUser: LoanRequestUser;

      if (updateLoanRequest.status === Status.Rechazado) {
        loanRequest.status = Status.Rechazado;

        // Crear y guardar el motivo de rechazo
        const motivoRechazo = this.motivosRechazoRepository.create({
          description: updateLoanRequest.observacion,
          createdAt: new Date(),
          solicitud: loanRequest,
        });
        loanRquestUser = this.loanRequestUserRepository.create({
          user: { id: updateLoanRequest.userAdminId },
          loanRequest,
          fechaSolicitud: new Date(),
        });
        await this.loanRequestUserRepository.save(loanRquestUser);
        await this.motivosRechazoRepository.save(motivoRechazo);

        loanRequest.motivos = [...(loanRequest.motivos || []), motivoRechazo];
      }

      if (updateLoanRequest.status === Status.Aprobado) {
        loanRequest.status = Status.Aprobado;
        loanRquestUser = this.loanRequestUserRepository.create({
          user: { id: updateLoanRequest.userAdminId },
          loanRequest,
          fechaSolicitud: new Date(),
        });
        await this.loanRequestUserRepository.save(loanRquestUser);
        await this.prestamoService.create(loanRequest);
      }

      return await this.loanRequestRepository.save(loanRequest);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al actualizar la solicitud');
    }
  }

  async enviarSolicitud(id: number) {
    return await this.loanRequestRepository.update(id, {
      status: Status.Pendiente,
    });
  }
}
