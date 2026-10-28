import { INSTITUTION_ADDRESS } from '#lib/brand/institution.js';

export const DEFAULT_TALK_LOCATION = INSTITUTION_ADDRESS;

export const DEFAULT_MEETING_ACTIVITIES: readonly string[] = [
	'Estudo do Evangelho',
	'Palestra doutrinária',
	'Passes e água fluidificada',
	'Atendimento fraterno',
	'Atendimento espiritual',
];

type TalkLogistics = { local: string | null; reuniaoCom: readonly string[] };

export const hasDefaultLocationAndActivities = ({ local, reuniaoCom }: TalkLogistics) =>
	local === DEFAULT_TALK_LOCATION &&
	reuniaoCom.length === DEFAULT_MEETING_ACTIVITIES.length &&
	reuniaoCom.every((activity, index) => activity === DEFAULT_MEETING_ACTIVITIES[index]);
