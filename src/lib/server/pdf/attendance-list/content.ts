export type AttendanceListDocument = { title: string; dates: string[]; generatedOn: string; workers: string[] };

export type AttendanceTextRole = 'aviso' | 'coluna' | 'nome';

export const normalizeWorkerName = (name: string) => name.trim().normalize('NFC').toLocaleUpperCase('pt-BR');

export const formatDateColumn = (isoDate: string) => {
	const [, , day] = isoDate.split('-');
	return day;
};
