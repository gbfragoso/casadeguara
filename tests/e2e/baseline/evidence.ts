import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const EVIDENCE_LABELS = ['linha-de-base', 'proposta'] as const;
export type EvidenceLabel = (typeof EVIDENCE_LABELS)[number];

const EVIDENCE_ROOT = join('tasks', 'prd-migracao-bulma-tailwind', 'evidencias');
const CAPTURES_FOLDER = 'capturas';
const INVENTORY_PARTS_FOLDER = 'inventario-partes';
export const INVENTORY_FILE = 'inventario.json';

const isEvidenceLabel = (value: string | undefined): value is EvidenceLabel =>
	EVIDENCE_LABELS.some((label) => label === value);

export const readEvidenceLabel = (value: string | undefined): EvidenceLabel => {
	if (isEvidenceLabel(value)) return value;
	throw new Error(
		`EVIDENCIAS deve ser um dos rótulos ${EVIDENCE_LABELS.join(', ')}; recebido: ${value ?? '(vazio)'}.`,
	);
};

export const EVIDENCE_LABEL = readEvidenceLabel(process.env.EVIDENCIAS);

export const evidenceDirectory = (label: EvidenceLabel) => join(EVIDENCE_ROOT, label);
export const capturesDirectory = (label: EvidenceLabel) => join(evidenceDirectory(label), CAPTURES_FOLDER);
export const inventoryPartsDirectory = (label: EvidenceLabel) => join(evidenceDirectory(label), INVENTORY_PARTS_FOLDER);

export const resetEvidence = async (label: EvidenceLabel) => {
	await Promise.all([
		rm(capturesDirectory(label), { recursive: true, force: true }),
		rm(inventoryPartsDirectory(label), { recursive: true, force: true }),
		rm(join(evidenceDirectory(label), INVENTORY_FILE), { force: true }),
	]);
	await mkdir(capturesDirectory(label), { recursive: true });
	await mkdir(inventoryPartsDirectory(label), { recursive: true });
};
