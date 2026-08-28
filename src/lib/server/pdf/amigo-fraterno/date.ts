import type { AmigoFraternoPdfRequest } from '$lib/validation/pdf/amigo-fraterno';

export const formatNextDrawDate = ({ nextDrawDate }: AmigoFraternoPdfRequest) => {
	const [year, month, day] = nextDrawDate.split('-');
	return `${day}/${month}/${year}`;
};
