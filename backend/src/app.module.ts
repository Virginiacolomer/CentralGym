import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembresiaModule } from './modules/membresia/membresia.module';
import { PlanEntrenamientoModule } from './modules/plan-entrenamiento/plan-entrenamiento.module';
import { SeguimientoModule } from './modules/seguimiento/seguimiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // solo dev
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MembresiaModule,
    PlanEntrenamientoModule,
    SeguimientoModule,
  ],
})
export class AppModule {}