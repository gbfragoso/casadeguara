import { read } from '$app/server';

import logoAsset from './casa-de-guara.png';

export const loadBrandLogo = async () => new Uint8Array(await read(logoAsset).arrayBuffer());
