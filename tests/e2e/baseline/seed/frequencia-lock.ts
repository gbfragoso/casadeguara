import { closeDatabase, createDatabase } from '../../cadastros-database';

export const holdFrequenciaLock = async (work: () => Promise<void>) => {
	const database = createDatabase();
	try {
		await database.begin(async (transaction) => {
			await transaction`lock table frequencia in access exclusive mode`;
			await work();
		});
	} finally {
		await closeDatabase(database);
	}
};
