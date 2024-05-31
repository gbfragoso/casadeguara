import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<form action="?/update" method="POST"><select name="status" id="status"><option value="Disponível" data-svelte-h="svelte-1tawtqi">Disponível</option></select> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form>`;
});
export {
  Page as default
};
