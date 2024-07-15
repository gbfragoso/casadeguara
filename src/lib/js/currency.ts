export function moeda(moeda: number) {
	return new Number(moeda).toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL'
	});
}
