import * as server from '../entries/pages/biblioteca/emprestimos/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/emprestimos/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/biblioteca/emprestimos/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.CNsTGNUp.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/await_block.C43LHaj5.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/dayjs.min.CxMP4GVf.js"];
export const stylesheets = [];
export const fonts = [];
