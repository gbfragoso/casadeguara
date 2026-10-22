const STATUS_MESSAGES: Partial<Record<number, string>> = {
	401: 'Sua sessão terminou. Entre novamente para continuar.',
	403: 'Você não tem permissão para acessar esta página.',
	404: 'Página não encontrada',
};
const SERVER_FAILURE_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente em instantes.';
const REQUEST_FAILURE_MESSAGE = 'Não foi possível concluir a solicitação.';
const FRAMEWORK_DEFAULT_MESSAGES = new Set(['Internal Error', 'Not Found', 'Forbidden', 'Unauthorized']);
const FIRST_SERVER_ERROR_STATUS = 500;

export const isServerFailure = (status: number) => status >= FIRST_SERVER_ERROR_STATUS;

const fallbackMessage = (status: number) =>
	STATUS_MESSAGES[status] ?? (isServerFailure(status) ? SERVER_FAILURE_MESSAGE : REQUEST_FAILURE_MESSAGE);

export const describeErrorMessage = (status: number, message: string | undefined) => {
	const trimmed = message?.trim();
	if (!trimmed || FRAMEWORK_DEFAULT_MESSAGES.has(trimmed)) return fallbackMessage(status);
	return trimmed;
};
