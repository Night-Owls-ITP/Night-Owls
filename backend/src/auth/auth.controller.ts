import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationService } from './authentication.service';
import { AuthenticatedUser } from './authenticated-user';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() credentials: LoginDto,
  ): Promise<{ access_token: string; user: AuthenticatedUser }> {
    const user = await this.authenticationService.authenticate(
      credentials.email,
      credentials.password,
    );
    const access_token = await this.jwtService.signAsync({ sub: user.id });

    return { access_token, user };
  }
}
