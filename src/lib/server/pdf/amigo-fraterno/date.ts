import type { AmigoFraternoPdfRequest } from '#lib/validation/pdf/amigo-fraterno.js';

export const formatNextDrawDate = ({ nextDrawDate }: AmigoFraternoPdfRequest) => {
	const [year, month, day] = nextDrawDate.split('-');
	return `${day}/${month}/${year}`;
};
