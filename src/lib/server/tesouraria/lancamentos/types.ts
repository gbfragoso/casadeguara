import type {
	CreateLancamento,
	EstornoSearch,
	LancamentoSearch,
	TipoLancamento,
} from '$lib/validation/tesouraria/lancamentos';
import type { db } from '$lib/server/database/connection';

export type { CreateLancamento, EstornoSearch, LancamentoSearch, TipoLancamento };
export type LancamentoDatabase = typeof db;
export type LancamentoTransaction = Parameters<Parameters<LancamentoDatabase['transaction']>[0]>[0];

export type CounterpartOption = { id: number; nome: string };

export type LancamentoItem = {
	id: number;
	tipo: TipoLancamento;
	descricao: string;
	valor: string;
	dataLancamento: string;
	contraparte: CounterpartOption | null;
	depositado: boolean | null;
	reciboUuid: string | null;
	dataRegistro: string | null;
};

export type LancamentoPage = {
	items: LancamentoItem[];
	totais: { entradas: string; saidas: string };
};

export type LancamentoDetail = LancamentoItem & {
	estornado: boolean;
	motivoEstorno: string | null;
	usuarioEstorno: string | null;
	dataEstorno: string | null;
};

export type CreatedLancamento = {
	id: number;
	tipo: TipoLancamento;
	uuidRecibo: string | null;
	dataRegistro: string | null;
};

export type EstornoItem = {
	id: number;
	tipo: TipoLancamento;
	contraparte: CounterpartOption | null;
	descricao: string;
	valor: string;
	dataLancamento: string;
	motivo: string;
	usuario: string;
	dataEstorno: string;
};

export type EstornoPage = { items: EstornoItem[] };

export type ReceiptData = {
	id: number;
	valor: string;
	descricao: string;
	contribuinte: string;
	dataEntrada: string;
	dataRegistro: string | null;
};

export type ReceiptState = { status: 'ativo'; entrada: ReceiptData } | { status: 'estornado'; motivo: string };

export type DashboardProjection = {
	entradaMesAtual: { count: number; median: number; value: string };
	saidaMesAtual: { value: string };
};

export type CashEntry = {
	identrada: number;
	descricao: string;
	dataEntrada: Date;
	valor: string;
	depositado: false;
	uuid: string;
	contribuinte: string;
	idcontribuinte: number;
	trabalhador: boolean | null;
};
