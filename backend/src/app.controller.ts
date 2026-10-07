import { Controller, Get } from '@nestjs/common';
import { Roles } from './auth/roles.decorator';
import { AppService } from './app.service';
import { UserRole } from './usuarios/user-role.enum';

@Controller()
@Roles(UserRole.ADMINISTRADOR)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
