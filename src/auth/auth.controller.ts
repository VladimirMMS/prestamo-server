import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Multer } from 'multer';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from 'src/helpers/fileFilter';
import { fileNamer } from 'src/helpers/fileNamer';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './uploads',
        filename: fileNamer,
      }),
    }),
  )
  async signup(
    @Body() signupDto: SignupDto,
    @UploadedFile() file: Multer.File,
  ) {
    return this.authService.signup(signupDto, file);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }
}
