import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './enum/user-roles.enum';
import { CredentialsDto } from 'src/auth/dto/credentials.dto';

export interface UserRepository extends Repository<User> {
  this: Repository<User>;
  createUser(createUserDto: CreateUserDto, role: UserRole): Promise<User>;
  hashPassword(password: string, salt: string): Promise<string>;
  checkCredentials(credentialsDto: CredentialsDto): Promise<User>;
}

export const customUserRepository: Pick<UserRepository, any> = {
  async createUser(
    this: UserRepository,
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const user = this.create();
    user.email = email;
    user.name = name;
    user.role = role;
    user.status = true;
    user.confirmationToken = crypto.randomBytes(32).toString('hex');
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    try {
      await user.save();
      delete user.password;
      delete user.salt;
      return user;
    } catch (error) {
      if (error.code.toString() === '23505') {
        throw new ConflictException('Endereço de email já está em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar o usuário no banco de dados',
        );
      }
    }
  },

  async checkCredentials(
    this: Repository<User>,
    credentialsDto: CredentialsDto,
  ): Promise<User> {
    const { email, password } = credentialsDto;
    const user = await this.findOne({
      where: {
        email: email,
        status: true,
      },
    });

    if (user && (await user.checkPassword(password))) {
      return user;
    } else {
      return null;
    }
  },

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  },
};
