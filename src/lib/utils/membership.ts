export const isMemberOf = <Member extends string>(members: readonly Member[], value: string): value is Member =>
	(members as readonly string[]).includes(value);
