import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  UploadedFiles,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Multer } from 'multer';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from 'src/helpers/fileFilter';
import { fileNamer } from 'src/helpers/fileNamer';
import { LoginUserDto } from './dto/login.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('check-token')
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

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

  @Patch('change-profile/userId/:userId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePic', maxCount: 1 },
        { name: 'idDocument', maxCount: 1 },
        { name: 'proofOfAddress', maxCount: 1 },
      ],
      {
        fileFilter: fileFilter,
        storage: diskStorage({
          destination: './uploads',
          filename: fileNamer,
        }),
      },
    ),
  )
  async changeProfile(
    @Param('userId') userId: string,
    @UploadedFiles()
    files: {
      profilePic?: Multer.File[];
      idDocument?: Multer.File[];
    },
  ) {
    return this.authService.changeProfile(+userId, {
      profilePic: files.profilePic?.[0],
      idDocument: files.idDocument?.[0],
    });
  }
}
