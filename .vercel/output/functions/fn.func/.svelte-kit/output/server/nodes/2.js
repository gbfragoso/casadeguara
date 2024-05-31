

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/biblioteca/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BFrI3d7H.js","_app/immutable/chunks/scheduler.BV6nWQwp.js","_app/immutable/chunks/index.1eVX9S-w.js"];
export const stylesheets = [];
export const fonts = [];
