import { c as create_ssr_component } from "../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<header data-svelte-h="svelte-cuh13k"><div class="container-fluid"><nav><ul><li><strong>Casa de Guará</strong></li></ul> <ul><li><a href="/biblioteca" class="contrast">Biblioteca</a></li> <li><a href="/financeiro" class="contrast">Financeiro</a></li></ul></nav></div></header> ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
