import * as server from '../entries/pages/biblioteca/livros/_page.server.ts.js';

export const index = 27;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/livros/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/livros/+page.server.ts";
export const imports = ["_app/immutable/nodes/27.DM6xY5tp.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/await_block.C43LHaj5.js","_app/immutable/chunks/each.D6YF6ztN.js"];
export const stylesheets = [];
export const fonts = [];
