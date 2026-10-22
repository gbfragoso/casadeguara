import type { TestDatabase } from './cadastros-database';

const LOAN_PERIOD = '14 days';

export const insertLoan = async (database: TestDatabase, livroId: number, leitorId: number, userId: string) => {
	const [loan] = await database<{ id: number }[]>`
		insert into emprestimo (leitor, exemplar, data_emprestimo, data_devolucao, renovacoes, user_emprestimo)
		select ${leitorId}, idexemplar, current_date, current_date + ${LOAN_PERIOD}::interval, 0, ${userId}
		from exemplar where livro = ${livroId} order by numero limit 1
		returning idemp as id
	`;
	if (!loan) throw new Error('Empréstimo de teste não foi criado.');
	return loan.id;
};
