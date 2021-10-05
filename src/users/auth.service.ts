import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const script = promisify(_script);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);
    // See if email is in use
    if (users.length) throw new BadRequestException('email in use');
    // Hash password
    const salt = randomBytes(8).toString('hex');
    const hash = (await script(password, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;
    // Create a user and save it
    const user = this.usersService.create(email, result);
    // return user
    return user;
  }
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await script(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
