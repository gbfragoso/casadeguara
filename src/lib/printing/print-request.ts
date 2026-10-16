export const PRINT_REQUEST_PARAM = 'imprimir';

type PrintRequestSteps = {
	clearRequest: () => Promise<void>;
	print: () => void;
};

export const appendPrintRequest = (path: string) => `${path}?${PRINT_REQUEST_PARAM}=1`;

export const hasPrintRequest = (url: URL) => url.searchParams.has(PRINT_REQUEST_PARAM);

export const fulfillPrintRequest = async (url: URL, { clearRequest, print }: PrintRequestSteps) => {
	if (!hasPrintRequest(url)) return false;

	await clearRequest();
	print();
	return true;
};
