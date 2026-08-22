import { z } from 'zod';

export const NOTICE_TEXT_MAX_LENGTH = 300;

const REQUIRED_NOTICE_TEXT_MESSAGE = 'O texto do aviso é obrigatório.';
const INVALID_NOTICE_TEXT_MESSAGE = 'O texto do aviso deve ser textual.';
const MAXIMUM_NOTICE_TEXT_MESSAGE = 'O texto do aviso excede o limite de caracteres.';

const noticeTextSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined || issue.input === null
				? REQUIRED_NOTICE_TEXT_MESSAGE
				: INVALID_NOTICE_TEXT_MESSAGE,
	})
	.refine((text) => text.trim().length > 0, REQUIRED_NOTICE_TEXT_MESSAGE)
	.max(NOTICE_TEXT_MAX_LENGTH, MAXIMUM_NOTICE_TEXT_MESSAGE);

export const avisoSchema = z.object({ texto: noticeTextSchema });
export type AvisoInput = z.infer<typeof avisoSchema>;
