import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembresiaModule } from './modules/membresia/membresia.module';
import { PlanEntrenamientoModule } from './modules/plan-entrenamiento/plan-entrenamiento.module';
import { SeguimientoModule } from './modules/seguimiento/seguimiento.module';
import { AppController } from './app.controller';
@Module({
  controllers: [AppController],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres' as const,
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
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