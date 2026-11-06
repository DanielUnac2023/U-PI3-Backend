import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirige automáticamente al usuario a la pantalla de inicio de sesión de Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const result = await this.authService.validarUsuarioGoogle(req.user);

    // En lugar de devolver JSON en pantalla, redirige al Frontend pasando el token y los datos por la URL
    const token = result.access_token;
    const userEncoded = encodeURIComponent(JSON.stringify(result.usuario));

    // Redirección al puerto de Vite / React (http://localhost:5173)
    return res.redirect(
      `http://localhost:5173?token=${token}&user=${userEncoded}`,
    );
  }
}
