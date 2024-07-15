import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const leitor = url.searchParams.get('leitor')?.toUpperCase() || undefined;
	const titulo = url.searchParams.get('titulo')?.toUpperCase() || undefined;
	const atrasados = url.searchParams.get('atrasados');
	const ativos = atrasados === "on" ? null : "on";

	const emprestimos = await prisma.emprestimo.findMany({
		take: 10,
		include: {
			leitor_emprestimo_leitorToleitor: {
				select: {
					idleitor: true,
					nome: true
				}
			},
			exemplar_emprestimo_exemplarToexemplar: {
				include: {
					livro_exemplar_livroTolivro: true
				}
			}
		},
		where: {
			...(leitor
				? {
						leitor_emprestimo_leitorToleitor: {
							nome: {
								contains: leitor,
								mode: 'insensitive'
							}
						}
					}
				: {}),
			...(titulo
				? {
						exemplar_emprestimo_exemplarToexemplar: {
							livro_exemplar_livroTolivro: {
								titulo: {
									startsWith: titulo,
									mode: 'insensitive'
								}
							}
						}
					}
				: {}),
			...(ativos
				? {
						data_devolvido: null
					}
				: {}),
			...(atrasados
				? {
						AND: [
							{
								data_devolvido: null
							},
							{
								data_devolucao: {
									lt: new Date()
								}
							}
						]
					}
				: {})
		}
	});
	return { emprestimos };
};
