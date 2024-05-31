import * as server from '../entries/pages/financeiro/saidas/_id_integer_/_page.server.ts.js';

export const index = 37;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/financeiro/saidas/_id_integer_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/financeiro/saidas/[id=integer]/+page.server.ts";
export const imports = ["_app/immutable/nodes/37.rEwm__MQ.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js","_app/immutable/chunks/date.COdMM5u4.js"];
export const stylesheets = [];
export const fonts = [];
