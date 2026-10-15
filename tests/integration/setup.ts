import { NODE_ENV, POSTGRES_URL } from '$app/env/private';
import { assertTestDatabase } from '../support/database';

assertTestDatabase();
assertTestDatabase({ ...process.env, NODE_ENV, POSTGRES_URL });
