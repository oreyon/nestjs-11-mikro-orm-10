import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    generator: TSMigrationGenerator,
  },
  debug: true,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator],
});
