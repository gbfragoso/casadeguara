import { cpf, rg } from '$lib/js/mask';
import type { CadastroModel } from '$lib/server/models/cadastro';

type BibliotecaReader = Exclude<Awaited<ReturnType<CadastroModel['getBiblioteca']>>, undefined>;

export const toReaderDetail = (reader: BibliotecaReader) => ({
	nome: reader.nome,
	rgMask: rg(reader.rg),
	cpfMask: cpf(reader.cpf),
	email: reader.email,
	celular: reader.celular,
	telefone: reader.telefone,
	logradouro: reader.logradouro,
	bairro: reader.bairro,
	complemento: reader.complemento,
	cidade: reader.cidade,
	cep: reader.cep,
	trab: reader.trab,
	status: reader.status,
});
