import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { configInstance, NodeEnv } from "./modules/app/app.config";
import { AppModule } from "./modules/app/app.module";
import { WinstonModule } from "nest-winston";
import winston from "winston";

async function bootstrap(): Promise<void> {
  // NestJS app.
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.json(),
            winston.format.prettyPrint({ colorize: true, depth: 1000 }),
          ),
        }),
      ],
    }),
  });

  app.enableCors(configInstance.app.cors);

  app.use(...configInstance.app.args.useHelmet);
  app.use(...configInstance.app.args.useCookieParser);
  app.use(...configInstance.app.args.useBodyParser);
  app.setGlobalPrefix(...configInstance.app.args.setGlobalPrefix);
  app.useGlobalPipes(...configInstance.app.args.useGlobalPipes);

  // Enable Swagger UI only in local and dev environment.
  if (configInstance.app.environment == NodeEnv.LOCAL) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle(configInstance.app.swagger.title)
      .setDescription(configInstance.app.swagger.description)
      .setContact(
        configInstance.app.swagger.contact.name,
        configInstance.app.swagger.contact.url,
        configInstance.app.swagger.contact.email,
      )
      .setExternalDoc("json", `/${configInstance.app.swagger.url}-json`)
      .setVersion(configInstance.app.version)
      // .setLicense("...", "...")
      .addTag("app", "Technical endpoints")
      .build();

    const document = SwaggerModule.createDocument(app, config, configInstance.app.swagger.documentOptions);
    SwaggerModule.setup(configInstance.app.swagger.url, app, document, configInstance.app.swagger.customOptions);
  }

  // Run the server.
  await app.listen(configInstance.app.port);
}
bootstrap();
