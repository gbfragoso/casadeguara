import { hasComunicacaoAdminAccess } from '#lib/server/authorization/comunicacao.js';
import type { TalkRules } from '#lib/server/models/palestra-write.js';

export type BoardUser = { id: string; roles: string };
export type TalkActionContext = { locals: { user: BoardUser | null }; request: Request };

export const readTalkRules = (user: BoardUser, today: string): TalkRules => ({
	today,
	allowPast: hasComunicacaoAdminAccess(user),
});

export const acceptsDate = (rules: TalkRules, data: string) => rules.allowPast || data >= rules.today;
