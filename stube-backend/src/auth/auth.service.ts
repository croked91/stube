import { AuthDto } from './auth.dto';
import { UserEntity } from './../-user/user.entity';
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) { }

  async login(dto: AuthDto) {

    const user = await this.validdateUser(dto)

    return {
      user: this.returnUserFields(user),
      accessToken: await this.issueAccesToken(user.id)
    }
  }

  async register(dto: AuthDto) {
    const oldUser = await this.userRepository.findOneBy(
      { email: dto.email }
    )
    if (oldUser) {
      throw new BadRequestException('Пользователь с таким Email уже зарегистрирован')
    }

    const salt = await genSalt(10)

    const newUser = await this.userRepository.create({
      email: dto.email,
      password: await hash(dto.password, salt)
    })

    const user = await this.userRepository.save(newUser)

    return {
      user: this.returnUserFields(user),
      accessToken: await this.issueAccesToken(user.id)
    }
  }

  async validdateUser(dto: AuthDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email
      },
      select: ['id', 'email', 'password']
    })

    if (!user) throw new NotFoundException('Пользователь не найден')

    const isValidPassword = await compare(dto.password, user.password)
    if (!isValidPassword) throw new UnauthorizedException('Не правильный пароль')

    return user
  }

  async issueAccesToken(userId: number) {
    const data = {
      id: userId
    }

    return await this.jwtService.signAsync(
      data,
      { expiresIn: '31d' }
    )
  }

  returnUserFields(user: UserEntity) {
    return {
      id: user.id,
      email: user.email
    }
  }
}
