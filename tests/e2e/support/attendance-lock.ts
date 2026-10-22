import type { TestDatabase } from '../cadastros-database';

export const holdAttendanceLock = (database: TestDatabase, work: () => Promise<void>) =>
	database.begin(async (transaction) => {
		await transaction`lock table frequencia in access exclusive mode`;
		await work();
	});
