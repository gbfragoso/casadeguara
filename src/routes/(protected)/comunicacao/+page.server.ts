import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => redirect(307, resolve('comunicacao/palestras'));
