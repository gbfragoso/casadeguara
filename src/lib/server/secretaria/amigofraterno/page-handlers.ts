import { type AmigoFraternoParticipant } from '#lib/server/pdf/amigo-fraterno/participant-projections.js';
import { amigoFraternoParticipants } from '#lib/server/pdf/amigo-fraterno/participants.js';

import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';

type ParticipantReader = { listSummary: () => PromiseLike<AmigoFraternoParticipant[]> };
type User = { id: string; roles: string } | null;

const createInternalAmigoFraternoLoad =
	(participants: ParticipantReader) =>
	async ({ locals }: { locals: { user: User } }) => {
		requireSecretariaAccess(locals.user);
		const list = await participants.listSummary();

		return {
			participants: list,
			total: list.length,
			withoutPhoto: list.filter(({ hasPhoto }) => !hasPhoto).length,
		};
	};

const load = createInternalAmigoFraternoLoad(amigoFraternoParticipants);

export const createSecretariaAmigofraternoHandlers = () => ({
	load,
});
