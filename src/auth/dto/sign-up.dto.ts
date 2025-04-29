import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsString()
  cedula: string;

  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsNotEmpty()
  @IsString()
  direccion: string;

  @IsNotEmpty()
  nacionalidadId: number;

  @IsNotEmpty()
  provinciaId: number;

  @IsNotEmpty()
  @IsString()
  tipoDocumento: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;
}
