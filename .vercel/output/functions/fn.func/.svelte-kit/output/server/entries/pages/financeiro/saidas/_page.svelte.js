import { c as create_ssr_component, b as subscribe, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
import { f as formatarData } from "../../../../chunks/date.js";
import { p as page } from "../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let saidas;
  let total;
  let currentPage;
  let totalPages;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ saidas, total } = data);
  currentPage = 1;
  totalPages = Math.ceil(total / 10);
  $$unsubscribe_page();
  return `<hgroup data-svelte-h="svelte-12m5vo3"><h2 class="pico-color-azure-500">Saídas</h2> <p>Listagem de despesas da instituição</p></hgroup> <div class="card" data-svelte-h="svelte-1eemr6"><form action="/financeiro/saidas" method="GET"><div class="flex-container"><label style="width: 100%">Descrição
				<input type="text" name="descricao" id="descricao" placeholder="Digite a descrição"></label> <label>Data Inicial
				<input type="date" name="dataInicio" aria-label="Date"></label> <label>Data final
				<input type="date" name="dataFim" aria-label="Date"></label></div> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/financeiro/saidas/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-1g757gs"><th scope="col">Descrição</th> <th scope="col">Valor</th> <th scope="col">Data</th> <th scope="col">Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-1g0va3q">Carregando resultados</tr> `;
    }
    return function() {
      return ` ${each(saidas, (saida) => {
        return `<tr><td>${escape(saida.descricao)}</td> <td>R$ ${escape(saida.valor)}</td> <td>${escape(formatarData(saida.data_saida))}</td> <td><a href="${"/financeiro/saidas/" + escape(saida.idsaida, true)}"><i class="fa-solid fa-pen-to-square"></i> </a></td> </tr>`;
      })} `;
    }();
  }(saidas)}</tbody></table> <div class="pagination"><button class="outline" data-svelte-h="svelte-5p59tj"><i class="fa-solid fa-angles-left"></i></button> <button class="outline" data-svelte-h="svelte-1tmcgtt"><i class="fa-solid fa-angle-left"></i></button> <p>Página ${escape(currentPage)} / ${escape(totalPages)}</p> <button class="outline" data-svelte-h="svelte-1mn017k"><i class="fa-solid fa-angle-right"></i></button> <button class="outline" data-svelte-h="svelte-1q3zd23"><i class="fa-solid fa-angles-right"></i></button></div></div>`;
});
export {
  Page as default
};
