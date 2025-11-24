import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from 'common/filter/http-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({ origin: '*',});

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Pokemon Manager API')
    .setDescription('Complete Pokemon management system with favorites')
    .setVersion('1.0')
    .addTag('pokemon')
    .build();
  const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
const port = process.env.PORT || 3000;
await app.listen(port);

const host = 'http://localhost';
const serviceBaseUrl = `${host}:${port}`;
const swaggerUrl = `${serviceBaseUrl}/api`;

console.log(`Service is running @ ${serviceBaseUrl}`);
console.log(`Swagger UI is available @ ${swaggerUrl}`);
console.log(`poking @ port ${port}`);
}
bootstrap();