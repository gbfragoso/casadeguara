type QueryableDocument = { querySelector: (selector: string) => unknown };

export const SHELL_REGIONS = '[data-testid="regiao-menu-lateral"], [data-testid="regiao-barra-superior"]';

export const hasModuleShell = (document: QueryableDocument) => document.querySelector(SHELL_REGIONS) !== null;
