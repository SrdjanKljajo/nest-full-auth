import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { PrismaClientExceptionFilter } from './exceptions/exceptions-handler';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
//import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors();
  //app.use(csurf({ cookie: true }));
  app.use(morgan('tiny'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Nest starter')
    .setDescription('Building nest starter api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { customSiteTitle: 'Nest start' });

  await app.listen(3333);
}
bootstrap();
