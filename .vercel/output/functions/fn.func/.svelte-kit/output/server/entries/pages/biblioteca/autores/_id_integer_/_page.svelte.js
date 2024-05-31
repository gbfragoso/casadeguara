import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let autor;
  let { data } = $$props;
  let { form } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  ({ autor } = data);
  return `<h2 data-svelte-h="svelte-1a3uezs">Atualizar autor</h2> <form action="?/update" method="POST"><input type="text" name="nome" id="nome"${add_attribute("value", autor.nome, 0)}> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form> ${form?.status === 200 ? `<p data-svelte-h="svelte-nyge9i">Autor atualizado com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
