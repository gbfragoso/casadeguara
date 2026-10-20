import { closeDatabase, createDatabase } from '../../cadastros-database';
import { createSeedCalendar } from './calendar';
import { insertLibrary } from './library';
import { insertAttendances, insertPeople, insertPhoto, insertUsers } from './people';
import { insertTreasury } from './treasury';

const READER_INDEXES = { first: 4, last: 6 };

export const seedBaselineDatabase = async (now: Date) => {
	const calendar = createSeedCalendar(now);
	const database = createDatabase();
	try {
		return await database.begin(async (transaction) => {
			const cadastroIds = await insertPeople(transaction);
			await insertPhoto(transaction, cadastroIds[0]);
			await insertAttendances(transaction, cadastroIds, calendar);
			const readers = cadastroIds.slice(READER_INDEXES.first, READER_INDEXES.last);
			const library = await insertLibrary(transaction, readers, calendar);
			await insertTreasury(transaction, cadastroIds, calendar);
			const users = await insertUsers(transaction);
			return { calendar, users, cadastroWithPhotoId: cadastroIds[0], ...library };
		});
	} finally {
		await closeDatabase(database);
	}
};
