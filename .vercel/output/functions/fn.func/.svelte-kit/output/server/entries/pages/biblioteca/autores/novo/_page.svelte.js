import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  return `<h2 data-svelte-h="svelte-14rxdkp">Cadastro de autores</h2> <form method="POST" role="group" data-svelte-h="svelte-t73yk5"><input type="text" name="nome" id="nome" placeholder="Digite o nome do autor"> <button>Cadastrar</button></form> ${form?.status === 201 ? `<p data-svelte-h="svelte-12m1p1m">Autor cadastrado com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
