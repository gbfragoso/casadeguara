import type { ParamMatcher } from '@sveltejs/kit';
import { validate } from 'uuid';

export const match: ParamMatcher = (param) => {
	return validate(param);
};
