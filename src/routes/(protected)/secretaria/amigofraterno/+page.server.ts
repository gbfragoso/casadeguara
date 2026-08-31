import { type AmigoFraternoParticipant } from '$lib/server/pdf/amigo-fraterno/participant-projections';
import { amigoFraternoParticipants } from '$lib/server/pdf/amigo-fraterno/participants';

import { requireSecretariaAccess } from '$lib/server/secretaria/access';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = createInternalAmigoFraternoLoad(amigoFraternoParticipants);
