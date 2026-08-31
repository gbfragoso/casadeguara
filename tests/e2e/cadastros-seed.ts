import type { CadastroFixture } from './cadastros-fixture';
import type { TestDatabase } from './cadastros-database';

const CADASTRO_LOCK = 7_942_021;

export const seedCadastro = async (database: TestDatabase, fixture: CadastroFixture) => {
	return database.begin(async (transaction) => {
		await transaction`select pg_advisory_xact_lock(${CADASTRO_LOCK})`;
		const [available] = await transaction<{ id: number }[]>`
			select candidate as id
			from generate_series(1, 32767) as candidate
			where not exists (
				select 1 from cadastros where idleitor = candidate
			)
			order by candidate
			limit 1
		`;
		if (!available) throw new Error('Não há identificador de cadastro disponível para a fixture.');

		const [created] = await transaction<{ idleitor: number }[]>`
			insert into cadastros (
				idleitor, nome, rg, cpf, email, celular, telefone, logradouro, bairro, complemento, cidade, cep,
				aniversario, trab
			)
			values (
				${available.id}, ${fixture.name}, ${fixture.rg}, ${fixture.cpf}, ${fixture.email}, ${fixture.cellphone},
				${fixture.phone}, ${fixture.street}, ${fixture.district}, ${fixture.complement}, ${fixture.city},
				${fixture.postalCode}, ${fixture.birthday}, true
			)
			returning idleitor
		`;

		return created.idleitor;
	});
};
