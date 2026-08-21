import { cpf, rg } from '$lib/js/mask';
import type { CadastroModel } from '$lib/server/models/cadastro';

type SecretariaCadastro = Exclude<Awaited<ReturnType<CadastroModel['getSecretaria']>>, undefined>;

const formatBirthday = (birthday: Date | null) => birthday?.toISOString().slice(0, 10) ?? null;

export const toSecretariaDetail = (cadastro: SecretariaCadastro) => ({
	nome: cadastro.nome,
	rgMask: rg(cadastro.rg),
	cpfMask: cpf(cadastro.cpf),
	email: cadastro.email,
	celular: cadastro.celular,
	telefone: cadastro.telefone,
	logradouro: cadastro.logradouro,
	bairro: cadastro.bairro,
	complemento: cadastro.complemento,
	cidade: cadastro.cidade,
	cep: cadastro.cep,
	aniversario: formatBirthday(cadastro.aniversario),
	trab: cadastro.trab,
	hasPhoto: cadastro.hasPhoto,
});
