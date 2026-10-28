import { buildBirthdayFileName, describeEmptyBirthdays } from '#lib/birthdays/format.js';
import {
	INVALID_BIRTHDAY_MONTH_MESSAGE,
	parseBirthdayMonth,
	resolveReferenceMonth,
	type BirthdayMonthOption,
} from '#lib/birthdays/months.js';
import { hasSecretariaAccess } from '#lib/server/authorization/cadastros.js';
import type { CadastroModel } from '#lib/server/models/cadastro.js';
import type { BirthdayListDocument } from '#lib/server/pdf/birthday-list/content.js';
import { createPdfResponse } from '#lib/server/pdf/response.js';
import type { GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import type { CalendarMonth } from '#lib/utils/calendar-month.js';

type BirthdayPdfDependencies = {
	birthdays: Pick<CadastroModel, 'listMonthBirthdays'>;
	generateList: (document: BirthdayListDocument) => Promise<GeneratedSheet>;
	today: () => string;
};

type BirthdayPdfUser = { id: string; roles: string };
type BirthdayPdfRequestContext = { locals: { user: BirthdayPdfUser | null }; url: URL };
type BirthdayPdfRequest = {
	option: BirthdayMonthOption;
	month: CalendarMonth;
	generatedOn: string;
	actorId: string;
	startedAt: number;
};

const OPERATION = 'gerar_pdf';
const UNAUTHENTICATED_MESSAGE = 'Usuário não autenticado.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';
const GENERATION_FAILURE_MESSAGE = 'Não foi possível gerar o PDF. Tente novamente.';
const UNAUTHENTICATED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const BAD_REQUEST_STATUS = 400;
const UNPROCESSABLE_STATUS = 422;
const SERVER_ERROR_STATUS = 500;

const reply = (message: string, status: number) => Response.json({ message }, { status });

const serveBirthdayList = async (
	{ birthdays, generateList }: BirthdayPdfDependencies,
	{ option, month, generatedOn, actorId, startedAt }: BirthdayPdfRequest,
): Promise<Response> => {
	const people = await birthdays.listMonthBirthdays(option.month);
	if (people.length === 0) {
		console.warn('secretaria.aniversariantes.pdf_vazio', { mes: month.key, actorId });
		return reply(describeEmptyBirthdays(option), UNPROCESSABLE_STATUS);
	}

	const list = await generateList({ month, generatedOn, people });
	console.info('secretaria.aniversariantes.pdf_gerado', {
		mes: month.key,
		quantidade: people.length,
		paginas: list.pageCount,
		bytes: list.bytes.byteLength,
		duracaoMs: performance.now() - startedAt,
		actorId,
	});
	return createPdfResponse(list.bytes, buildBirthdayFileName(month));
};

export const createBirthdayPdfHandler =
	(dependencies: BirthdayPdfDependencies) =>
	async ({ locals, url }: BirthdayPdfRequestContext) => {
		const { user } = locals;
		if (!user) return reply(UNAUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
		if (!hasSecretariaAccess(user)) return reply(FORBIDDEN_MESSAGE, FORBIDDEN_STATUS);

		const option = parseBirthdayMonth(url.searchParams.get('mes'));
		if (!option) return reply(INVALID_BIRTHDAY_MONTH_MESSAGE, BAD_REQUEST_STATUS);

		const startedAt = performance.now();
		const generatedOn = dependencies.today();
		const month = resolveReferenceMonth(option.month, generatedOn);
		try {
			return await serveBirthdayList(dependencies, { option, month, generatedOn, actorId: user.id, startedAt });
		} catch (cause) {
			console.error('secretaria.aniversariantes.falha', { operacao: OPERATION, mes: month.key, error: cause });
			return reply(GENERATION_FAILURE_MESSAGE, SERVER_ERROR_STATUS);
		}
	};
