import 'dotenv/config';
import { defineConfig, ReflectMetadataProvider } from '@mikro-orm/mysql';
import { Logger } from 'winston';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { SeedManager } from '@mikro-orm/seeder';

const mikroOrmLogger: (message: string) => void = (message: string): void => {
  const logger = new Logger();
  logger.log.bind(message);
};

const isProduction: boolean = process.env.NODE_ENV === 'production';

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  pool: { min: 2, max: 10 },
  entities: isProduction ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  // entities: ['dist/**/*.entity.js'],
  // entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    transactional: true, // wrap each migration in a transaction
    snapshot: true, // save snapshot when creating new migrations
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
  debug: true,
  ensureDatabase: true,
  // logger: (message: string): void => Logger.log(message, 'MikroORM'),
  logger: mikroOrmLogger,
  highlighter: new SqlHighlighter(),
  metadataProvider: isProduction
    ? ReflectMetadataProvider
    : TsMorphMetadataProvider,
  // metadataProvider: TsMorphMetadataProvider,
  extensions: [Migrator, EntityGenerator, SeedManager],
});
