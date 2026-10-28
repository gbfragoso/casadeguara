import type { BirthdayListDocument } from '#lib/server/pdf/birthday-list/content.js';
import type { BirthdaySource } from '#lib/server/models/cadastro-birthdays.js';
import { GENERATED_ON, NOVEMBER_2026 } from '../../sheet/support/sheet-fixtures';

export { GENERATED_ON, NOVEMBER_2026 };

const exactly = (text: string, length: number) => {
	if (text.length !== length) throw new Error(`Fixture "${text}" has ${text.length} characters, expected ${length}.`);
	return text;
};

export const MAY_2027 = { key: '2027-05', year: 2027, month: 5 };

export const BASE_PERSON: BirthdaySource = { id: 1843, nome: 'Maria das Graças Lima', dia: 7, desencarnado: false };

export const createBirthdayDocument = (
	people: BirthdaySource[],
	month: BirthdayListDocument['month'] = NOVEMBER_2026,
): BirthdayListDocument => ({ month, generatedOn: GENERATED_ON, people });

const REALISTIC_NAMES = [
	'Maria das Graças Lima Santos de Oliveira Melo',
	'José Carlos Moreira da Silva Andrade Rebouças',
	'Ana Clara dos Santos Pereira Albuquerque Neto',
	'Antônio Francisco de Assis Nascimento Barroso',
	'Francisca Aparecida de Jesus Conceição Seixas',
	'Luiz Fernando Cavalcanti de Menezes Guimarães',
	'Raimunda Nonata Bittencourt Guimarães Freitas',
	'Sebastião Ribeiro Gonçalves de Magalhães Lima',
	'Terezinha de Jesus Vasconcelos Monteiro Diniz',
	'Benedito Aparecido Cerqueira dos Anjos Mattos',
	'Josefa Maria do Carmo Figueiredo Nogueira Paz',
	'Manoel Messias Wanderley de Carvalho Pinheiro',
	'Conceição Aparecida Fagundes Rodrigues Passos',
	'Geraldo Magela Sampaio de Queiroz Fontes Reis',
	'Marlene Aparecida dos Santos Bomfim Rodrigues',
	'Valdemaro Wanderley de Albuquerque Montenegro',
	'Edileuza Conceição de Almeida Prado Junqueira',
	'Raimundo Nonato Bezerra de Menezes Cavalcante',
	'Iracema Batista de Oliveira Mascarenhas Lopes',
	"Osvaldo Cruz Nepomuceno de Sant'Ana Barcellos",
	'Zuleide Mariana Magalhães de Castro Wanderley',
	'Hermenegildo Pereira da Costa Bulhões Dourado',
	'Doralice Aparecida Guimarães Rocha Figueiredo',
	'Waldomiro Bonifácio de Mendonça e Vasconcelos',
	'Ivonete Conceição Brandão Fernandes de Moraes',
	'Mauro Wellington Gusmão de Albuquerque Mattos',
].map((name) => exactly(name, 45));

const MAY_DAYS_BY_GROUP_SIZE = [
	{ size: 3, days: [1, 3] },
	{ size: 2, days: [4, 6, 8, 10, 12, 14] },
	{ size: 1, days: [16, 18, 20, 22, 24, 26, 28, 30] },
];

const MAY_DESENCARNADOS = new Set([0, 13]);

const MAY_BIRTHDAY_DAYS = MAY_DAYS_BY_GROUP_SIZE.flatMap(({ size, days }) =>
	days.flatMap((day) => Array.from({ length: size }, () => day)),
);

export const MAY_PROFILE_PEOPLE: BirthdaySource[] = MAY_BIRTHDAY_DAYS.map((dia, index) => ({
	id: index + 1,
	nome: REALISTIC_NAMES[index],
	dia,
	desencarnado: MAY_DESENCARNADOS.has(index),
}));

const GIVEN_NAMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Elisa', 'Fábio', 'Glória', 'Heitor', 'Iara'];
const SURNAMES = ['Souza Lima', 'Pereira Rocha', 'Santos Barros', 'Oliveira Melo', 'Cardoso Neves'];
const FULL_MONTH_DAYS = 30;
const FULL_MONTH_SIZE = 45;

export const FULL_MONTH_PEOPLE: BirthdaySource[] = Array.from({ length: FULL_MONTH_SIZE }, (_, index) => ({
	id: index + 1,
	nome: `${GIVEN_NAMES[index % GIVEN_NAMES.length]} ${SURNAMES[Math.floor(index / GIVEN_NAMES.length)]}`,
	dia: (index % FULL_MONTH_DAYS) + 1,
	desencarnado: false,
})).sort((first, second) => first.dia - second.dia);

export const WIDE_DESENCARNADO: BirthdaySource = {
	id: 77,
	nome: exactly('Wolfgang Maximiliano Wanderley Mendonça Montenegro de Mamede', 60),
	dia: 7,
	desencarnado: true,
};
