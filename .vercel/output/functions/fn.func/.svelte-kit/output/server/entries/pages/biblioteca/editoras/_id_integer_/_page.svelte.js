import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let editora;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ editora } = data);
  return `<form action="?/update" method="POST"><input type="text" name="nome" id="nome"${add_attribute("value", editora.nome, 0)}> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form>`;
});
export {
  Page as default
};
