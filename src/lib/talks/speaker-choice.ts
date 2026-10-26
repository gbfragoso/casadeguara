export type SpeakerChoice = { palestranteId: string; novoPalestrante: string; texto: string };

export const createEmptySpeakerChoice = (): SpeakerChoice => ({ palestranteId: '', novoPalestrante: '', texto: '' });

export const isSpeakerChoiceUnconfirmed = ({ palestranteId, novoPalestrante, texto }: SpeakerChoice) =>
	texto.trim() !== '' && palestranteId === '' && novoPalestrante === '';
