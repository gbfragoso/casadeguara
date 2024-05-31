import * as server from '../entries/pages/biblioteca/leitores/_page.server.ts.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/leitores/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/leitores/+page.server.ts";
export const imports = ["_app/immutable/nodes/24.C1-9E7YT.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/await_block.C43LHaj5.js","_app/immutable/chunks/each.D6YF6ztN.js"];
export const stylesheets = [];
export const fonts = [];
