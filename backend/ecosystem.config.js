import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rootEnvPath = path.resolve(projectRoot, '.env');

// Parse environment variables from project root .env
let rootEnv = {};
if (fs.existsSync(rootEnvPath)) {
  const envContent = fs.readFileSync(rootEnvPath, 'utf8');
  rootEnv = dotenv.parse(envContent);
}

export const apps = [
  {
    name: 'kashbites-server',
    script: 'src/app.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: ['--env-file=' + rootEnvPath],
    env: {
      ...rootEnv,
      NODE_ENV: 'development',
    },
    env_production: {
      ...rootEnv,
      NODE_ENV: 'production',
    },
  },
  {
    name: 'kashbites-workers',
    script: 'src/workers/main.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: ['--env-file=' + rootEnvPath],
    env: {
      ...rootEnv,
      NODE_ENV: 'development',
    },
    env_production: {
      ...rootEnv,
      NODE_ENV: 'production',
    },
  },
  {
    name: 'kashbites-crons',
    script: 'src/crons/main.cron.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    node_args: ['--env-file=' + rootEnvPath],
    env: {
      ...rootEnv,
      NODE_ENV: 'development',
    },
    env_production: {
      ...rootEnv,
      NODE_ENV: 'production',
    },
  },
];

export default {
  apps,
};
