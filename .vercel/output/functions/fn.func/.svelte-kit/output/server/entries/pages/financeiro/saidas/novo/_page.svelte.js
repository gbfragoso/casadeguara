import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  return `<hgroup data-svelte-h="svelte-4vke47"><h2 class="pico-color-azure-500">Despesas</h2> <p>Lançamento de despesas</p></hgroup> <form method="POST" data-svelte-h="svelte-1bfcdub"><label>Valor
		<input type="number" name="valor" id="valor" min="1" step="any" placeholder="Digite o valor do pagamento"></label> <label>Descrição
		<input type="text" name="descricao" id="descricao" placeholder="Digite a descrição do pagamento"></label> <label>Data da pagamento
		<input type="date" name="data_despesa" aria-label="Date"></label> <button>Cadastrar</button></form> ${form?.status === 201 ? `<p data-svelte-h="svelte-814g4t">Pagamento cadastrado com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
