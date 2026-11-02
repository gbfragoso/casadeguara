import type { TestDatabase } from '../cadastros-database';

export const holdCadastrosLock = (database: TestDatabase, work: () => Promise<void>) =>
	database.begin(async (transaction) => {
		await transaction`lock table cadastros in access exclusive mode`;
		await work();
	});
