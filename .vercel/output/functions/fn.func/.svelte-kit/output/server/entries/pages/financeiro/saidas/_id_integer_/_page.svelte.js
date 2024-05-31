import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
import { i as isodate } from "../../../../../chunks/date.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let saida;
  let { data } = $$props;
  let { form } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  ({ saida } = data);
  return `<hgroup data-svelte-h="svelte-170flpm"><h2>Entradas</h2> <p>Atualizar os dados da doação</p></hgroup> <form action="?/update" method="POST"><label>Valor
		<input type="number" name="valor" id="valor"${add_attribute("value", saida.valor, 0)}></label> <label>Descrição
		<input type="text" name="descricao" id="descricao"${add_attribute("value", saida.descricao, 0)}></label> <label>Data do pagamento
		<input type="date" name="data_saida" aria-label="Date"${add_attribute("value", isodate(saida.data_saida), 0)}></label> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form> ${form?.status === 200 ? `<p data-svelte-h="svelte-3xrbbc">Doação atualizada com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
