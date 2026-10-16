import { defineParams } from '@sveltejs/kit/params';
import { validate } from 'uuid';
import validator from 'validator';

export const params = defineParams({
	alphanumeric: (param) => (validator.isAlphanumeric(param) ? param : undefined),
	integer: (param) => (validator.isNumeric(param) ? param : undefined),
	uuid: (param) => (validate(param) ? param : undefined),
});
