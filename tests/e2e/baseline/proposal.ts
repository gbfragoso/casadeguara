import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { CaptureTarget } from './capture';

export type ProposalPrototype = CaptureTarget & { print?: boolean; baseline: boolean };

const PROPOSAL_ROOT = join('tasks', 'prd-migracao-bulma-tailwind', 'proposta');
const PROTOTYPES_FOLDER = 'prototipos';
const VERSION_PATTERN = /^v(\d+)$/;

export const PROPOSAL_PROTOTYPES: readonly ProposalPrototype[] = [
	{ screenId: 'menus-abertos', stateId: 'menu-usuario', baseline: true },
	{ screenId: 'menus-abertos', stateId: 'menu-lateral', baseline: true },
	{ screenId: 'login', stateId: 'validacao', baseline: true },
	{ screenId: 'sistemas', stateId: 'inicial', baseline: true },
	{ screenId: 'erro-404', stateId: 'inicial', baseline: true },
	{ screenId: 'biblioteca-inicio', stateId: 'inicial', baseline: true },
	{ screenId: 'tesouraria-painel', stateId: 'inicial', baseline: true },
	{ screenId: 'tesouraria-painel', stateId: 'carregando', baseline: false },
	{ screenId: 'livros', stateId: 'resultados', print: true, baseline: true },
	{ screenId: 'livros', stateId: 'notificacao', baseline: true },
	{ screenId: 'livros', stateId: 'modal', baseline: true },
	{ screenId: 'livro-cadastro', stateId: 'inicial', baseline: true },
	{ screenId: 'usuario-novo', stateId: 'progresso', baseline: true },
	{ screenId: 'padroes', stateId: 'catalogo', baseline: false },
	{ screenId: 'acervo', stateId: 'resultados', baseline: true },
	{ screenId: 'recibo', stateId: 'inicial', print: true, baseline: true },
	{ screenId: 'recibo-estornado', stateId: 'inicial', print: true, baseline: true },
	{ screenId: 'recibo-termico', stateId: 'inicial', print: true, baseline: true },
];

const versionNumber = (folder: string) => Number(VERSION_PATTERN.exec(folder)?.[1] ?? Number.NaN);

const latestVersion = () => {
	const versions = readdirSync(PROPOSAL_ROOT).filter((folder) => VERSION_PATTERN.test(folder));
	const latest = versions.sort((first, second) => versionNumber(second) - versionNumber(first))[0];
	if (!latest) throw new Error(`Nenhuma versão v<N> da proposta em ${PROPOSAL_ROOT}.`);
	return latest;
};

export const readProposalVersion = (value: string | undefined) => {
	if (value === undefined) return latestVersion();
	if (VERSION_PATTERN.test(value)) return value;
	throw new Error(`PROPOSTA deve ter o formato v<N>; recebido: ${value}.`);
};

export const prototypeId = ({ screenId, stateId }: CaptureTarget) => `${screenId}-${stateId}`;

export const prototypesDirectory = (version: string) => join(PROPOSAL_ROOT, version, PROTOTYPES_FOLDER);

export const prototypeUrl = (version: string, prototype: CaptureTarget) =>
	pathToFileURL(resolve(prototypesDirectory(version), `${prototypeId(prototype)}.html`)).href;
