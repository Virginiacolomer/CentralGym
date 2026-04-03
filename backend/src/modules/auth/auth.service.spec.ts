import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

type MockRepository = {
  findOne: jest.Mock;
};

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  nombre: 'Test',
  apellido: 'User',
  dni: '12345678',
  email: 'test@example.com',
  password_hash: 'hashed-password',
  role: UserRole.CLIENTE,
  estado: UserStatus.ACTIVO,
  seguimiento: null,
  userMembresias: [],
  pagos: [],
  planEntrenamientoId: null,
  planEntrenamiento: null,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository;
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if email does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: '123456' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    userRepository.findOne.mockResolvedValue(buildUser());
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'test@example.com', password: 'bad-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user is not active', async () => {
    userRepository.findOne.mockResolvedValue(buildUser({ estado: UserStatus.CREADO }));
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    await expect(
      service.login({ email: 'test@example.com', password: '123456' }),
    ).rejects.toThrow(new ForbiddenException('Espera que tu entrenador habilite tu cuenta!'));
  });

  it('should return access token and user data when credentials are valid and user is active', async () => {
    userRepository.findOne.mockResolvedValue(buildUser({ id: 12, estado: UserStatus.ACTIVO }));
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue('mock-token');

    const result = await service.login({ email: 'test@example.com', password: '123456' });

    expect(result).toEqual({
      accessToken: 'mock-token',
      user: expect.objectContaining({
        id: 12,
        email: 'test@example.com',
        estado: UserStatus.ACTIVO,
      }),
    });
    expect(result.user).not.toHaveProperty('password_hash');
    expect(jwtService.signAsync).toHaveBeenCalled();
  });
});
