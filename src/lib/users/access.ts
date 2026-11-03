import type { SystemModulePath } from '#lib/navigation/system-modules.js';

export { SUPERUSER_ROLE } from '#lib/navigation/system-modules.js';

export const ACCESS_LEVEL_VALUES = ['none', 'volunteer', 'coordination'] as const;
export type AccessLevel = (typeof ACCESS_LEVEL_VALUES)[number];

export const ACCESS_LEVEL_LABELS: Readonly<Record<AccessLevel, string>> = {
	none: 'Sem acesso',
	volunteer: 'Voluntário',
	coordination: 'Coordenação',
};

export const ACCESS_LEVELS: readonly { value: AccessLevel; label: string }[] = ACCESS_LEVEL_VALUES.map((value) => ({
	value,
	label: ACCESS_LEVEL_LABELS[value],
}));

export type ModuleAccess = Record<SystemModulePath, AccessLevel>;
export type UserAccess = { modules: ModuleAccess; superuser: boolean };

export const accessFieldName = (module: SystemModulePath) => `access-${module}` as const;

export const mapSystemModules = <Value>(
	read: (module: SystemModulePath) => Value,
): Record<SystemModulePath, Value> => ({
	biblioteca: read('biblioteca'),
	secretaria: read('secretaria'),
	tesouraria: read('tesouraria'),
	comunicacao: read('comunicacao'),
});

export const hasAnyAccess = (access: UserAccess) =>
	access.superuser || Object.values(access.modules).some((level) => level !== 'none');
