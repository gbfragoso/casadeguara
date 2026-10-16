import { db } from '#lib/server/database/connection.js';
import { cadastros, emprestimo, exemplar, livro } from '#lib/server/database/schema.js';
import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
import { eq, sql, type AnyColumn } from 'drizzle-orm';

const formatCivilDate = (column: AnyColumn) => sql<string | null>`to_char(${column}, 'DD/MM/YYYY')`;

const receiptFields = {
	idemp: emprestimo.idemp,
	leitor: cadastros.nome,
	tombo: livro.tombo,
	titulo: livro.titulo,
	exemplar: exemplar.numero,
	dataEmprestimo: formatCivilDate(emprestimo.dataEmprestimo),
	dataDevolucao: formatCivilDate(emprestimo.dataDevolucao),
};

export class EmprestimoModel {
	constructor(private readonly database: typeof db = db) {}

	async findReceipt(id: number): Promise<ReciboEmprestimo | undefined> {
		const [receipt] = await this.database
			.select(receiptFields)
			.from(emprestimo)
			.innerJoin(cadastros, eq(emprestimo.leitor, cadastros.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(eq(emprestimo.idemp, id))
			.limit(1);

		return receipt;
	}
}

export const emprestimoModel = new EmprestimoModel();
