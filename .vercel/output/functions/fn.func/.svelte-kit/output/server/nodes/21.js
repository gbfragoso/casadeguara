import * as server from '../entries/pages/biblioteca/keywords/_page.server.ts.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/keywords/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/keywords/+page.server.ts";
export const imports = ["_app/immutable/nodes/21.Dj4iGMgA.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/await_block.C43LHaj5.js","_app/immutable/chunks/each.D6YF6ztN.js"];
export const stylesheets = [];
export const fonts = [];
