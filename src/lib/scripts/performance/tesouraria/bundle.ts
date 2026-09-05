import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

type ManifestEntry = {
	file: string;
	name?: string;
	isEntry?: boolean;
	imports?: string[];
};

export type BundleFileMeasurement = {
	file: string;
	rawBytes: number;
	gzipBytes: number;
};

export type BundleMeasurement = {
	route: string;
	routeNodeIds: number[];
	files: BundleFileMeasurement[];
	rawBytes: number;
	gzipBytes: number;
};

type ClientManifest = Record<string, ManifestEntry>;

const CLIENT_OUTPUT = resolve('.svelte-kit/output/client');
const MANIFEST_PATH = join(CLIENT_OUTPUT, '.vite/manifest.json');

function parseRouteNodeIds(source: string, route: string) {
	const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const routePattern = new RegExp(`"${escapedRoute}":\\[(-?\\d+),\\[([^\\]]*)\\]\\]`);
	const match = routePattern.exec(source);
	if (!match) throw new Error(`Route ${route} was not found in the client manifest entry.`);
	const pageNode = Number(match[1]);
	const layoutNodes = match[2]
		.split(',')
		.map((value) => Number(value.trim()))
		.filter((value) => Number.isInteger(value));
	return [...new Set([Math.abs(pageNode), ...layoutNodes])];
}

function findAppManifestKey(manifest: ClientManifest) {
	const entry = Object.entries(manifest).find(([, value]) => value.isEntry && value.name === 'entry/app');
	if (!entry) throw new Error('Client app entry was not found in the Vite manifest.');
	return entry[0];
}

function findNodeManifestKey(manifest: ClientManifest, nodeId: number) {
	const suffix = `/nodes/${nodeId}.js`;
	const entry = Object.entries(manifest).find(([key]) => key.endsWith(suffix));
	if (!entry) throw new Error(`Client node ${nodeId} was not found in the Vite manifest.`);
	return entry[0];
}

function resolveImportKey(manifest: ClientManifest, key: string) {
	if (manifest[key]) return key;
	const entry = Object.entries(manifest).find(([, value]) => basename(value.file) === basename(key));
	if (!entry) throw new Error(`Manifest import ${key} was not found.`);
	return entry[0];
}

function collectManifestKeys(manifest: ClientManifest, roots: string[]) {
	const keys = new Set<string>();
	const visit = (key: string) => {
		if (keys.has(key)) return;
		const entry = manifest[key];
		if (!entry) throw new Error(`Manifest entry ${key} was not found.`);
		keys.add(key);
		(entry.imports ?? []).map((importKey) => resolveImportKey(manifest, importKey)).forEach(visit);
	};
	roots.forEach(visit);
	return [...keys];
}

export async function readClientManifest(manifestPath = MANIFEST_PATH) {
	return JSON.parse(await readFile(manifestPath, 'utf8')) as ClientManifest;
}

export async function measureTreasuryBundle(
	manifestPath = MANIFEST_PATH,
	clientOutput = CLIENT_OUTPUT,
	route = '/(protected)/tesouraria',
): Promise<BundleMeasurement> {
	const manifest = await readClientManifest(manifestPath);
	const appKey = findAppManifestKey(manifest);
	const appSource = await readFile(join(clientOutput, manifest[appKey].file), 'utf8');
	const routeNodeIds = parseRouteNodeIds(appSource, route);
	const roots = [appKey, ...routeNodeIds.map((nodeId) => findNodeManifestKey(manifest, nodeId))];
	const files = await Promise.all(
		collectManifestKeys(manifest, roots).map(async (key) => {
			const file = manifest[key].file;
			const content = await readFile(join(clientOutput, file));
			return { file, rawBytes: content.byteLength, gzipBytes: gzipSync(content, { level: 9 }).byteLength };
		}),
	);
	return {
		route,
		routeNodeIds,
		files: files.sort((left, right) => left.file.localeCompare(right.file)),
		rawBytes: files.reduce((total, file) => total + file.rawBytes, 0),
		gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
	};
}

export function captureBuildEnvironment() {
	return {
		capturedAt: new Date().toISOString(),
		node: process.version,
		revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
	};
}
