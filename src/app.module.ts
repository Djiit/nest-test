import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OpenTelemetryModule } from '@metinseylan/nestjs-opentelemetry';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SentryModule } from '@ntegral/nestjs-sentry';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: [
        {
          level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty' }
              : {},
          useLevelLabels: true,
        },
      ],
    }),
    OpenTelemetryModule.forRoot({
      instrumentations: [getNodeAutoInstrumentations()],
      metricExporter: new PrometheusExporter({
        endpoint: 'metrics',
        port: 9464,
      }),
      metricInterval: 1000,
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: process.env.NODE_ENV !== 'production',
      environment: process.env.NODE_ENV,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
