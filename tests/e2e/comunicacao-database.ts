import type { TestDatabase } from './cadastros-database';

export const deleteUserByUsername = async (database: TestDatabase, username: string) => {
	await database`delete from "Session" where "userId" in (select id from "User" where username = ${username})`;
	await database`delete from "User" where username = ${username}`;
};
