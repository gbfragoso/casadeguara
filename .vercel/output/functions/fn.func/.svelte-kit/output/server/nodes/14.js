import * as server from '../entries/pages/biblioteca/editoras/_id_integer_/_page.server.ts.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/editoras/_id_integer_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/editoras/[id=integer]/+page.server.ts";
export const imports = ["_app/immutable/nodes/14.tSqe5IIw.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js"];
export const stylesheets = [];
export const fonts = [];
