import { c as create_ssr_component } from "../../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main class="wrapper container-fluid"><aside class="sidebar pico-background-amber-200" data-svelte-h="svelte-lf5ym"><nav><ul><li><a href="/financeiro/entradas" class="contrast">Entradas</a></li> <li><a href="/financeiro/saidas" class="contrast">Saídas</a></li> <li><a href="/financeiro/contribuintes" class="contrast">Contribuintes</a></li></ul></nav></aside> <section>${slots.default ? slots.default({}) : ``}</section></main>`;
});
export {
  Layout as default
};
