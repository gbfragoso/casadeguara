import type { ParamMatcher } from '@sveltejs/kit';
import validator from 'validator';

export const match: ParamMatcher = (param) => {
	return validator.isNumeric(param);
};
