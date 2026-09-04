import { cadastros, estornos, lancamentos } from '$lib/server/database/schema';

export const lancamentoProjection = {
	id: lancamentos.idlancamento,
	tipo: lancamentos.tipo,
	descricao: lancamentos.descricao,
	valor: lancamentos.valor,
	dataLancamento: lancamentos.dataLancamento,
	idcontraparte: lancamentos.idcontraparte,
	depositado: lancamentos.depositado,
	reciboUuid: lancamentos.uuidRecibo,
	dataRegistro: lancamentos.dataRegistro,
	contraparteId: cadastros.idleitor,
	contraparteNome: cadastros.nome,
	trabalhador: cadastros.trab,
};

export const reversalProjection = {
	...lancamentoProjection,
	motivo: estornos.motivo,
	usuario: estornos.userEstorno,
	dataEstorno: estornos.dataEstorno,
};
