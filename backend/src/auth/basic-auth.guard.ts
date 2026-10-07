import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { AuthenticatedUser } from './authenticated-user';

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const authorization = request.headers.authorization;
    const credentials = this.parseAuthorization(authorization);

    if (!credentials) {
      return this.reject(response);
    }

    try {
      request.user = await this.authenticationService.authenticate(
        credentials.email,
        credentials.password,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return this.reject(response);
      }
      throw error;
    }
  }

  private reject(response: Response): never {
    response.setHeader('WWW-Authenticate', 'Basic realm="Night-Owls"');
    throw new UnauthorizedException('Credenciales inválidas');
  }

  private parseAuthorization(
    authorization: string | undefined,
  ): { email: string; password: string } | null {
    if (!authorization) {
      return null;
    }

    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
    if (!match) {
      return null;
    }

    const encoded = match[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const canonical = Buffer.from(decoded, 'utf8')
      .toString('base64')
      .replace(/=+$/, '');
    if (canonical !== encoded.replace(/=+$/, '')) {
      return null;
    }

    const separator = decoded.indexOf(':');
    if (separator <= 0) {
      return null;
    }

    return {
      email: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  }
}
