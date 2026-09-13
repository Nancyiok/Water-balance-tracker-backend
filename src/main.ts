import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParcer from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParcer());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Water Balance Tracker App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  console.log(`App is running on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
