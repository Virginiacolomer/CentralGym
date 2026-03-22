import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 importante para frontend en Vercel después
  app.enableCors();
console.log('PORT:', process.env.PORT);
await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();