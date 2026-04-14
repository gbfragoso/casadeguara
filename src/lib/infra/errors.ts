type ErrorData = {
	message?: string;
	action?: string;
	cause?: Error;
	fieldErrors?: object;
	statusCode?: number;
};

export class InternalServerError extends Error {
	statusCode: number;
	action: string;

	constructor({ cause, statusCode }: ErrorData) {
		super('Um erro interno não esperado aconteceu.', {
			cause,
		});
		this.name = 'InternalServerError';
		this.action = 'Entre em contato com o suporte';
		this.statusCode = statusCode || 500;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class ServiceError extends Error {
	statusCode: number;
	action: string;

	constructor({ message, cause }: ErrorData) {
		super(message || 'Serviço indisponível no momento.', {
			cause,
		});
		this.name = 'ServiceError';
		this.action = 'Verifique se o serviço está disponível.';
		this.statusCode = 503;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class ValidationError extends Error {
	fieldErrors: object;
	statusCode: number;
	action: string;

	constructor({ message, action, fieldErrors, cause }: ErrorData) {
		super(message || 'Um erro de validação ocorreu.', {
			cause,
		});
		this.name = 'ValidationError';
		this.fieldErrors = fieldErrors as object;
		this.action = action || 'Verifique os dados enviados e tente novamente.';
		this.statusCode = 400;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			fieldErrors: this.fieldErrors,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class NotFoundError extends Error {
	statusCode: number;
	action: string;

	constructor({ message, action, cause }: ErrorData) {
		super(message || 'Não foi possível encontrar este recurso no sistema.', {
			cause,
		});
		this.name = 'NotFoundError';
		this.action = action || 'Verifique se os parâmetros enviados na consulta estão certos.';
		this.statusCode = 404;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}

export class UnauthorizedError extends Error {
	statusCode: number;
	action: string;

	constructor({ message, action, cause }: ErrorData) {
		super(message || 'Credenciais inválidas', {
			cause,
		});
		this.name = 'UnauthorizedError';
		this.action = action || 'Verifique as informações e tente novamente.';
		this.statusCode = 401;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode,
		};
	}
}
