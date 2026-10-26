import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';

import { createTalkCreateAction } from './create-action';
import { createTalkDeleteAction } from './delete-action';
import { createTalkBoardLoad } from './load';
import { createTalkMoveAction } from './move-action';
import { createTalkUpdateAction } from './update-action';

export type TalkBoardDependencies = {
	talks: Pick<PalestraModel, 'listAgenda' | 'listHistory' | 'suggestTimes' | 'create' | 'update' | 'move' | 'remove'>;
	speakers: Pick<PalestranteModel, 'listOptions'>;
	today: () => string;
};

export const createTalkBoardHandlers = (dependencies: TalkBoardDependencies) => ({
	load: createTalkBoardLoad(dependencies),
	actions: {
		criar: createTalkCreateAction(dependencies),
		atualizar: createTalkUpdateAction(dependencies),
		mover: createTalkMoveAction(dependencies),
		excluir: createTalkDeleteAction(dependencies),
	},
});
