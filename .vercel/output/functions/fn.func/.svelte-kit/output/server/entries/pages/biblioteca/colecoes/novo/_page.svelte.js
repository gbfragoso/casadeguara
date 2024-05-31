import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  return `<h2 data-svelte-h="svelte-1emzvx1">Cadastro de coleções</h2> <form method="POST" data-svelte-h="svelte-1fwloqf"><input type="text" name="nome" id="nome"> <button>Cadastrar</button></form> ${form?.status === 201 ? `<p data-svelte-h="svelte-1tsuy8r">Coleção cadastrada com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
