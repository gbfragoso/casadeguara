import type { Actions } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { cadastros, emprestimo, exemplar, livro } from '#lib/server/database/schema.js';
import { requireLibraryAdminAccess } from '#lib/server/authorization/biblioteca.js';
import { redirect } from '@sveltejs/kit';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';

const listOverdueLoans = async () =>
	db
		.select({
			idemp: emprestimo.idemp,
			idleitor: cadastros.idleitor,
			leitor: cadastros.nome,
			celular: cadastros.celular,
			telefone: cadastros.telefone,
			email: cadastros.email,
			cobranca: emprestimo.cobranca,
			titulo: livro.titulo,
			numero: exemplar.numero,
			renovacoes: emprestimo.renovacoes,
			data_devolucao: emprestimo.dataDevolucao,
			data_emprestimo: emprestimo.dataEmprestimo,
			data_devolvido: emprestimo.dataDevolvido,
		})
		.from(emprestimo)
		.innerJoin(cadastros, eq(emprestimo.leitor, cadastros.idleitor))
		.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
		.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
		.where(and(lt(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido)))
		.orderBy(desc(emprestimo.dataEmprestimo));

const load = async ({ locals }: { locals: App.Locals }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes('biblioteca:admin')) redirect(302, '/biblioteca');

	return { emprestimos: listOverdueLoans() };
};

const WHATSAPP_ORIGIN = 'https://wa.me';
const EMAIL_SUBJECT = 'Prazo para devolução expirado';
const SIGNATURE = 'Atenciosamente, Clébio Fragoso';

type ChargeEvent = { request: Request; locals: App.Locals };
type ChargeNotice = { id: string; titulo: string; leitor: string; prazo: string };

const readChargeNotice = (form: FormData): ChargeNotice => ({
	id: form.get('id') as string,
	titulo: form.get('titulo') as string,
	leitor: form.get('leitor') as string,
	prazo: form.get('prazo') as string,
});

const describeOverdueLoan = ({ titulo, prazo }: ChargeNotice) =>
	`prazo para devolução do livro ${titulo} expirou em ${prazo}, se possível dirigir-se à biblioteca para regularização.`;

const buildWhatsappMessage = (notice: ChargeNotice) =>
	`Estimado(a) ${notice.leitor}, o ${describeOverdueLoan(notice)} ${SIGNATURE}`;

const buildEmailMessage = (notice: ChargeNotice) =>
	`Estimado(a) ${notice.leitor},\r\n\r\nO ${describeOverdueLoan(notice)}\r\n\r\n${SIGNATURE}`;

const registerCharge = async (id: string) => {
	await db
		.update(emprestimo)
		.set({ cobranca: new Date() })
		.where(eq(emprestimo.idemp, Number(id)));
};

const actions = {
	whatsapp: async ({ request, locals }: ChargeEvent) => {
		requireLibraryAdminAccess(locals.user);

		const form = await request.formData();
		const notice = readChargeNotice(form);
		const telefone = form.get('telefone') as string;

		await registerCharge(notice.id);

		const text = encodeURIComponent(buildWhatsappMessage(notice));
		redirect(302, `${WHATSAPP_ORIGIN}/${telefone}?text=${text}`, { external: [WHATSAPP_ORIGIN] });
	},
	email: async ({ request, locals }: ChargeEvent) => {
		requireLibraryAdminAccess(locals.user);

		const form = await request.formData();
		const notice = readChargeNotice(form);
		const email = form.get('email') as string;

		await registerCharge(notice.id);

		const subject = encodeURIComponent(EMAIL_SUBJECT);
		const body = encodeURIComponent(buildEmailMessage(notice));
		redirect(302, `mailto:${email}?subject=${subject}&body=${body}`, { external: true });
	},
} satisfies Actions;

export const createBibliotecaCobrancasHandlers = () => ({
	load,
	actions,
});
