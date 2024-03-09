import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './enum/user-roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Role } from 'src/auth/decorators/role.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.usersService.createAdminUser(createUserDto);
    return {
      user,
      message: 'Administrador cadastrado com sucesso',
    };
  }
}
