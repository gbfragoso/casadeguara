import type { AmigoFraternoPdfRequest } from '$lib/validation/amigo-fraterno/pdf';

export const formatNextDrawDate = ({ nextDrawDate }: AmigoFraternoPdfRequest) => {
	const [year, month, day] = nextDrawDate.split('-');
	return `${day}/${month}/${year}`;
};
