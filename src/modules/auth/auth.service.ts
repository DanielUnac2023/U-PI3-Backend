import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js'; // Ajusta la ruta si PrismaService está en otra ubicación
import { Rol } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validarUsuarioGoogle(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
  }) {
    let usuario = await this.prisma.usuario.findUnique({
      where: { correo: googleUser.email },
    });

    if (!usuario) {
      // Registro automático como ESTUDIANTE si inicia sesión por primera vez
      usuario = await this.prisma.usuario.create({
        data: {
          nombre: `${googleUser.firstName} ${googleUser.lastName}`,
          correo: googleUser.email,
          googleId: googleUser.googleId,
          rol: Rol.ESTUDIANTE,
        },
      });
    } else if (!usuario.googleId) {
      // Si el correo ya existía en BD (ej. precargado), vinculamos su googleId
      usuario = await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { googleId: googleUser.googleId },
      });
    }

    if (usuario.estado === 'SANCIONADO') {
      throw new UnauthorizedException('El usuario se encuentra sancionado.');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario,
    };
  }
}
