import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  global.CronRunning = false;

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Nest clamav scanner')
    .setDescription(
      'NestJS ClamAV Scanner using ClamAV.js for scanning files and streams.',
    )
    .setVersion('1.0')
    .setContact(
      'Bratislava Innovations',
      'https://inovacie.bratislava.sk',
      'inovacie@bratislava.sk',
    )
    .addServer('http://localhost:' + PORT + '/')
    .addServer('https://nest-clamav-scanner.dev.bratislava.sk/')
    .addServer('https://nest-clamav-scanner.staging.bratislava.sk/')
    .addServer('https://nest-clamav-scanner.bratislava.sk/')
    .addBasicAuth({
      type: 'http',
      description: 'Basic auth for communication with scanner backend',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.getHttpAdapter().get('/spec-json', (req, res) => res.json(document));

  await app.listen(PORT);
  console.log(`Nest is running on port: ${PORT}`);
}

bootstrap();
