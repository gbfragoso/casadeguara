import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let keyword;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ keyword } = data);
  return `<form action="?/update" method="POST"><input type="text" name="chave" id="chave"${add_attribute("value", keyword.chave, 0)}> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form>`;
});
export {
  Page as default
};
