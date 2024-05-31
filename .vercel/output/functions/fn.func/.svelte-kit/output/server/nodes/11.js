import * as server from '../entries/pages/biblioteca/colecoes/_id_integer_/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/colecoes/_id_integer_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/colecoes/[id=integer]/+page.server.ts";
export const imports = ["_app/immutable/nodes/11.DxA7Pbt-.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js"];
export const stylesheets = [];
export const fonts = [];
