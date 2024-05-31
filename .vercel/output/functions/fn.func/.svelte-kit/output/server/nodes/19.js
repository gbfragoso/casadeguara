import * as server from '../entries/pages/biblioteca/exemplares/novo/_page.server.ts.js';

export const index = 19;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/exemplares/novo/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/exemplares/novo/+page.server.ts";
export const imports = ["_app/immutable/nodes/19.DtPb2oMo.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js"];
export const stylesheets = [];
export const fonts = [];
