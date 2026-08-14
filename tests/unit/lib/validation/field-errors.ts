import { flattenError, type ZodSafeParseResult } from 'zod';

export function getFieldErrors<T>(result: ZodSafeParseResult<T>) {
	if (result.success) return undefined;

	return flattenError(result.error).fieldErrors;
}
