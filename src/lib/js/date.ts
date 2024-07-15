export function formatarData(date: string) {
	return new Date(date)
		.toLocaleString('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'long'
		})
		.substring(0, 10);
}

export function isodate(date: string) {
	return new Date(date).toISOString().substring(0, 10);
}
