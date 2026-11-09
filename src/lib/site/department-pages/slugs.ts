import { isMemberOf } from '#lib/utils/membership.js';

export const DEPARTMENT_PAGE_SLUGS = ['biblioteca', 'evangelizacao', 'juventude', 'manjedoura', 'recanto'] as const;

export type DepartmentPageSlug = (typeof DEPARTMENT_PAGE_SLUGS)[number];

export const isDepartmentPageSlug = (value: string) => isMemberOf(DEPARTMENT_PAGE_SLUGS, value);
