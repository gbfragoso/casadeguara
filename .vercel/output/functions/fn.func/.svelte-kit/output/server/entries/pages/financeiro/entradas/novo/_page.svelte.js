import { c as create_ssr_component, f as add_attribute, e as escape, i as is_promise, n as noop, d as each } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let contribuintes;
  let { data } = $$props;
  let { form } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  ({ contribuintes } = data);
  return `<hgroup data-svelte-h="svelte-1a0rstk"><h2 class="pico-color-azure-500">Entradas</h2> <p>Lançamento de doações e valores recebidos</p></hgroup> <form method="POST"><label>Doador
		<input type="text" name="nome" placeholder="Digite o nome do doador" list="contribuintes"${add_attribute("aria-invalid", form?.field === "nome" ? "true" : void 0, 0)}${add_attribute("aria-describedby", form?.field === "nome" ? "nome-error" : void 0, 0)}> ${form?.field === "nome" ? `<small id="nome-error">${escape(form?.message)}</small>` : ``} <datalist id="contribuintes">${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function(contribuintes2) {
      return ` ${each(contribuintes2, (contribuinte) => {
        return `<option${add_attribute("value", contribuinte.nome, 0)}></option>`;
      })} `;
    }(__value);
  }(contribuintes)}</datalist></label> <label data-svelte-h="svelte-1q1jsp0">Descrição
		<input type="text" name="descricao" min="1" step="any" placeholder="Discriminação do valor recebido"></label> <div class="flex-container" data-svelte-h="svelte-1wm9ahv"><label>Valor
			<input type="number" name="valor" min="1" step="any" placeholder="Digite o valor da doação"></label> <label>Data do recebimento
			<input type="date" name="data_entrada" aria-label="Date"></label></div> <button type="submit" data-svelte-h="svelte-148w8ms">Cadastrar</button></form> ${form?.status === 201 ? `<p data-svelte-h="svelte-2hha3w">Doação cadastrada com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
