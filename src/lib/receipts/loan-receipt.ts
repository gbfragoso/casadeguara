export type ReciboEmprestimo = {
	idemp: number;
	leitor: string;
	tombo: string;
	titulo: string;
	exemplar: number;
	dataEmprestimo: string | null;
	dataDevolucao: string | null;
};
