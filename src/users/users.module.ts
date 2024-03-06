import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  TypeOrmModule,
  getDataSourceToken,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { User } from './user.entity';
import { DataSource } from 'typeorm';
import { customUserRepository } from './users.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    {
      provide: getRepositoryToken(User),
      inject: [getDataSourceToken()],
      useFactory(datasource: DataSource) {
        return datasource.getRepository(User).extend(customUserRepository);
      },
    },
    UsersService,
  ],
})
export class UsersModule {}
