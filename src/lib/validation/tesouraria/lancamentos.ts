import { z } from 'zod';
import {
	booleanSchema,
	dateSchema,
	descriptionSchema,
	integerSchema,
	INVALID_BOOLEAN_MESSAGE,
	INVALID_DATA_MESSAGE,
	INVALID_DESCRIPTION_MESSAGE,
	INVALID_FILTER_MESSAGE,
	INVALID_RANGE_MESSAGE,
	INVALID_REASON_MESSAGE,
	MAX_TEXT_LENGTH,
	normalizeBoolean,
	normalizeInteger,
	REQUIRED_COUNTERPART_MESSAGE,
	REQUIRED_IDS_MESSAGE,
	REQUIRED_REASON_MESSAGE,
	valueSchema,
} from './common';
const optionalText = (message: string) =>
	z.preprocess(
		(value) => (typeof value === 'string' ? value.trim() || null : value),
		z.string({ error: message }).trim().max(MAX_TEXT_LENGTH, message).nullable().default(null),
	);
const optionalDate = z.preprocess(
	(value) => (typeof value === 'string' ? value.trim() || null : value),
	dateSchema.nullable().default(null),
);
const optionalBoolean = z.preprocess(
	(value) => (value === '' || value === undefined ? null : normalizeBoolean(value)),
	z.boolean({ error: INVALID_BOOLEAN_MESSAGE }).nullable().default(null),
);
const entrySchema = z.strictObject(
	{
		tipo: z.literal('entrada'),
		contraparteId: z.preprocess(
			(value) => normalizeInteger(value, undefined),
			integerSchema(REQUIRED_COUNTERPART_MESSAGE),
		),
		descricao: descriptionSchema,
		valor: valueSchema,
		dataLancamento: dateSchema,
		depositado: booleanSchema.default(false),
	},
	INVALID_DATA_MESSAGE,
);
const exitSchema = z.strictObject(
	{
		tipo: z.literal('saida'),
		contraparteId: z.preprocess((value) => normalizeInteger(value, null), integerSchema().nullable()),
		descricao: descriptionSchema,
		valor: valueSchema,
		dataLancamento: dateSchema,
	},
	INVALID_DATA_MESSAGE,
);

export const createLancamentoFormSchema = z.discriminatedUnion('tipo', [entrySchema, exitSchema]);
export const createLancamentoSchema = createLancamentoFormSchema;
const searchType = z.enum(['todos', 'entrada', 'saida']).default('todos');
const operationalSearchFields = {
	tipo: searchType,
	contraparte: optionalText(INVALID_FILTER_MESSAGE),
	descricao: optionalText(INVALID_DESCRIPTION_MESSAGE),
	dataInicio: optionalDate,
	dataFim: optionalDate,
	dataRegistro: optionalDate,
	depositado: optionalBoolean,
	trabalhadores: optionalBoolean,
};
const validateOperationalSearch = (
	value: z.infer<z.ZodObject<typeof operationalSearchFields>>,
	context: z.RefinementCtx,
) => {
	if (value.tipo !== 'entrada') {
		(['dataRegistro', 'depositado', 'trabalhadores'] as const).forEach((field) => {
			if (value[field] !== null)
				context.addIssue({ code: 'custom', message: INVALID_FILTER_MESSAGE, path: [field] });
		});
	}
	if (value.dataInicio && value.dataFim && value.dataInicio > value.dataFim) {
		context.addIssue({ code: 'custom', message: INVALID_RANGE_MESSAGE, path: ['dataFim'] });
	}
};
export const lancamentoSearchSchema = z
	.strictObject(operationalSearchFields, INVALID_DATA_MESSAGE)
	.superRefine(validateOperationalSearch);
const reversalSearchFields = {
	tipo: searchType,
	contraparte: optionalText(INVALID_FILTER_MESSAGE),
	descricao: optionalText(INVALID_DESCRIPTION_MESSAGE),
	lancamentoInicio: optionalDate,
	lancamentoFim: optionalDate,
	estornoInicio: optionalDate,
	estornoFim: optionalDate,
};
const validateRange = (start: string | null, end: string | null, field: string, context: z.RefinementCtx) => {
	if (start && end && start > end)
		context.addIssue({ code: 'custom', message: INVALID_RANGE_MESSAGE, path: [field] });
};
export const estornoSearchSchema = z
	.strictObject(reversalSearchFields, INVALID_DATA_MESSAGE)
	.superRefine((value, context) => {
		validateRange(value.lancamentoInicio, value.lancamentoFim, 'lancamentoFim', context);
		validateRange(value.estornoInicio, value.estornoFim, 'estornoFim', context);
	});

export const estornoReasonSchema = z
	.string({ error: REQUIRED_REASON_MESSAGE })
	.trim()
	.min(1, REQUIRED_REASON_MESSAGE)
	.max(MAX_TEXT_LENGTH, INVALID_REASON_MESSAGE);
export const motivoEstornoSchema = z.strictObject({ motivo: estornoReasonSchema }, INVALID_DATA_MESSAGE);
const normalizeIds = (value: unknown) => (Array.isArray(value) ? value : value === undefined ? [] : [value]);
export const depositIdsSchema = z.preprocess(
	normalizeIds,
	z
		.array(z.preprocess((value) => normalizeInteger(value, undefined), integerSchema('ID de lançamento inválido.')))
		.min(1, REQUIRED_IDS_MESSAGE)
		.transform((ids) => [...new Set(ids)]),
);
export const confirmDepositsSchema = z.strictObject({ ids: depositIdsSchema }, INVALID_DATA_MESSAGE);

export type TipoLancamento = 'entrada' | 'saida';
export type CreateLancamentoForm = z.output<typeof createLancamentoFormSchema>;
export type CreateLancamento = CreateLancamentoForm;
export type LancamentoSearch = z.output<typeof lancamentoSearchSchema>;
export type EstornoSearch = z.output<typeof estornoSearchSchema>;
export type EstornoReason = z.output<typeof estornoReasonSchema>;
export type DepositIds = z.output<typeof depositIdsSchema>;
