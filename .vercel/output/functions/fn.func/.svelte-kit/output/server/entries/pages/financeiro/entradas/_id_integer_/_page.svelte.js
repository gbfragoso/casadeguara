import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
import { i as isodate } from "../../../../../chunks/date.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let entrada;
  let { data } = $$props;
  let { form } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  ({ entrada } = data);
  return `<hgroup data-svelte-h="svelte-2dfluw"><h2 class="pico-color-azure-500">Entradas</h2> <p>Atualizar os dados da doação</p></hgroup> <form action="?/update" method="POST"><div class="flex-container"><label>Valor
			<input type="number" name="valor" id="valor"${add_attribute("value", entrada.valor, 0)}></label> <label>Data do recebimento
			<input type="date" name="data_entrada"${add_attribute("value", isodate(entrada.data_entrada), 0)}></label></div> <button type="submit" style="width: auto" data-svelte-h="svelte-1w5zqd9">Atualizar</button></form> ${form?.status === 200 ? `<p data-svelte-h="svelte-3xrbbc">Doação atualizada com sucesso!</p>` : ``}`;
});
export {
  Page as default
};
