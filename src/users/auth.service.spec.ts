import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    expect.assertions(1);
    try {
      await service.signup('asdf@asdf.com', 'mypassword');
    } catch (err) {
      expect(err.name).toMatch('BadRequestException');
    }
  });

  it('throws a 404 error if sign in is called with an email that does not exist', async () => {
    expect.assertions(1);
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    expect.assertions(1);
    try {
      await service.signin('asdf@asdf.com', 'invalidpass');
    } catch (err) {
      expect(err.name).toMatch('BadRequestException');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
