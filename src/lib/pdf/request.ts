import type { z } from 'zod';

export type PdfResult<Failure> = { ok: true; pdf: Blob } | ({ ok: false } & Failure);

export type PdfFailureContract<Failure> = {
	schema: z.ZodType<Failure>;
	fallback: Failure;
	logEvent: string;
	logContext: Record<string, string>;
};

const readFailure = async <Failure>(
	response: Response,
	{ schema, fallback }: PdfFailureContract<Failure>,
): Promise<PdfResult<Failure>> => {
	const body: unknown = await response.json().catch(() => null);
	const parsed = schema.safeParse(body);
	return { ok: false, ...(parsed.success ? parsed.data : fallback) };
};

const translateResponse = async <Failure>(
	response: Response,
	contract: PdfFailureContract<Failure>,
): Promise<PdfResult<Failure>> =>
	response.ok ? { ok: true, pdf: await response.blob() } : readFailure(response, contract);

export const requestPdf = async <Failure>(
	fetcher: typeof fetch,
	url: string,
	signal: AbortSignal,
	contract: PdfFailureContract<Failure>,
): Promise<PdfResult<Failure>> => {
	try {
		return await translateResponse(await fetcher(url, { signal }), contract);
	} catch (cause) {
		if (!signal.aborted) console.error(contract.logEvent, { ...contract.logContext, error: cause });
		return { ok: false, ...contract.fallback };
	}
};
