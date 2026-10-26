import {
	MEETING_ACTIVITIES_MAX_COUNT,
	MEETING_ACTIVITY_MAX_LENGTH,
	TALK_LOCATION_MAX_LENGTH,
	TALK_NOTES_MAX_LENGTH,
	TALK_TITLE_MAX_LENGTH,
} from '#lib/validation/comunicacao/palestras.js';

export type TalkArtFacts = {
	titulo: string | null;
	observacoes: string | null;
	local: string | null;
	reuniaoCom: readonly string[];
	palestrante: { nome: string } | null;
};

export type ReadyTalk<T extends TalkArtFacts> = T & { titulo: string; palestrante: NonNullable<T['palestrante']> };

const BLOCKER_MESSAGES = {
	'titulo-palestrante-ausentes': 'Para gerar a arte, defina o título e o palestrante da palestra.',
	'titulo-ausente': 'Para gerar a arte, defina o título da palestra.',
	'palestrante-ausente': 'Para gerar a arte, defina o palestrante da palestra.',
	'titulo-longo': 'O título está maior do que cabe na arte. Encurte-o no card para gerar a arte.',
	'observacoes-longas': 'As observações estão maiores do que cabe na arte. Encurte-as no card para gerar a arte.',
	'local-longo': 'O local está maior do que cabe na arte. Encurte-o no card para gerar a arte.',
	'reuniao-com-invalida': 'As atividades de “Reunião com” não cabem na arte. Ajuste-as no card para gerar a arte.',
} as const;

export type TalkArtBlockerCode = keyof typeof BLOCKER_MESSAGES;

export type TalkArtBlocker = { codigo: TalkArtBlockerCode; mensagem: string };

export type TalkArtReadiness<T extends TalkArtFacts> =
	{ ready: true; talk: ReadyTalk<T> } | { ready: false; blocker: TalkArtBlocker };

const exceeds = (text: string | null, maxLength: number) => (text?.length ?? 0) > maxLength;

const hasInvalidActivities = (activities: readonly string[]) =>
	activities.length > MEETING_ACTIVITIES_MAX_COUNT ||
	activities.some((activity) => activity.length > MEETING_ACTIVITY_MAX_LENGTH);

const findMissingData = ({ titulo, palestrante }: TalkArtFacts): TalkArtBlockerCode => {
	if (!titulo && !palestrante) return 'titulo-palestrante-ausentes';
	return titulo ? 'palestrante-ausente' : 'titulo-ausente';
};

const findOversizedText = (talk: TalkArtFacts): TalkArtBlockerCode | null => {
	if (exceeds(talk.titulo, TALK_TITLE_MAX_LENGTH)) return 'titulo-longo';
	if (exceeds(talk.observacoes, TALK_NOTES_MAX_LENGTH)) return 'observacoes-longas';
	if (exceeds(talk.local, TALK_LOCATION_MAX_LENGTH)) return 'local-longo';
	if (hasInvalidActivities(talk.reuniaoCom)) return 'reuniao-com-invalida';
	return null;
};

const hasRequiredData = <T extends TalkArtFacts>(talk: T): talk is ReadyTalk<T> =>
	Boolean(talk.titulo) && talk.palestrante !== null;

const block = (codigo: TalkArtBlockerCode): { ready: false; blocker: TalkArtBlocker } => ({
	ready: false,
	blocker: { codigo, mensagem: BLOCKER_MESSAGES[codigo] },
});

export const checkTalkArtReadiness = <T extends TalkArtFacts>(talk: T): TalkArtReadiness<T> => {
	if (!hasRequiredData(talk)) return block(findMissingData(talk));
	const oversizedText = findOversizedText(talk);
	return oversizedText ? block(oversizedText) : { ready: true, talk };
};
