import { defineConfig } from '@mikro-orm/mysql';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import 'dotenv/config';
import path from 'path';

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [path.resolve(__dirname + '/**/*.entity.{ts,js}')],
  migrations: {
    path: __dirname + '/migrations',
    pathTs: 'src/migrations',
    generator: TSMigrationGenerator,
  },
  debug: true,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator],
});
