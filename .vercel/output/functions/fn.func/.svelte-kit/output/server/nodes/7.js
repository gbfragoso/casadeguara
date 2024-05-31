import * as server from '../entries/pages/biblioteca/autores/novo/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/autores/novo/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/autores/novo/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.DLZJAbCk.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js"];
export const stylesheets = [];
export const fonts = [];
