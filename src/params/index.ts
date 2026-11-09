import { defineParams } from '@sveltejs/kit/params';
import { validate } from 'uuid';
import validator from 'validator';

import { isDepartmentPageSlug } from '#lib/site/department-pages/slugs.js';
import { isStudyMaterialSlug } from '#lib/site/study-materials/slugs.js';

const POSTGRES_INTEGER_MAX = 2_147_483_647;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

const isDatabaseId = (param: string) => POSITIVE_INTEGER.test(param) && Number(param) <= POSTGRES_INTEGER_MAX;

export const params = defineParams({
	alphanumeric: (param) => (validator.isAlphanumeric(param) ? param : undefined),
	departamento: (param) => (isDepartmentPageSlug(param) ? param : undefined),
	integer: (param) => (isDatabaseId(param) ? param : undefined),
	material: (param) => (isStudyMaterialSlug(param) ? param : undefined),
	uuid: (param) => (validate(param) ? param : undefined),
});
