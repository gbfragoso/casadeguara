import * as server from '../entries/pages/financeiro/_page.server.ts.js';

export const index = 30;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/financeiro/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/financeiro/+page.server.ts";
export const imports = ["_app/immutable/nodes/30.DnO0T6ed.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/await_block.C43LHaj5.js"];
export const stylesheets = [];
export const fonts = [];
