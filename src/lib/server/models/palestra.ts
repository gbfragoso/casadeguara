import { db } from '#lib/server/database/connection.js';
import type { TalkChange, TalkCreateData, TalkMoveRequest, TalkTarget } from '#lib/validation/comunicacao/palestras.js';

import { findArtSource } from './palestra-art';
import { listAgenda, listHistory, suggestTimes } from './palestra-board';
import { moveTalk } from './palestra-move';
import type { TalkDatabase } from './palestra-projections';
import { createTalk, removeTalk, updateTalk, type TalkRules } from './palestra-write';

export class PalestraModel {
	constructor(private readonly database: TalkDatabase = db) {}

	listAgenda(today: string) {
		return listAgenda(this.database, today);
	}

	listHistory(today: string, page: number) {
		return listHistory(this.database, today, page);
	}

	suggestTimes() {
		return suggestTimes(this.database);
	}

	findArtSource(id: number) {
		return findArtSource(this.database, id);
	}

	create(input: TalkCreateData, actorId: string) {
		return createTalk(this.database, input, actorId);
	}

	update(target: TalkTarget, change: TalkChange, rules: TalkRules, actorId: string) {
		return updateTalk(this.database, target, change, rules, actorId);
	}

	move(request: TalkMoveRequest, today: string, actorId: string) {
		return moveTalk(this.database, request, today, actorId);
	}

	remove(id: number) {
		return removeTalk(this.database, id);
	}
}

export const palestraModel = new PalestraModel();
