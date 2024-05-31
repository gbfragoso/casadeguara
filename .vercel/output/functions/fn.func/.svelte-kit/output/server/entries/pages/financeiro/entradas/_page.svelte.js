import { c as create_ssr_component, b as subscribe, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
import dayjs from "dayjs";
import { p as page } from "../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let entradas;
  let total;
  let currentPage;
  let totalPages;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ entradas, total } = data);
  currentPage = 1;
  totalPages = Math.ceil(total / 10);
  $$unsubscribe_page();
  return `<hgroup data-svelte-h="svelte-uplxx2"><h2 class="pico-color-azure-500">Entradas</h2> <p>Lista de doações e/ou valores recebidos</p></hgroup> <div class="card" data-svelte-h="svelte-1dud0uh"><form action="/financeiro/entradas" method="GET"><div class="flex-container"><label style="width: 100%">Contribuinte
				<input type="text" name="contribuinte" id="contribuinte" placeholder="Digite o nome do contribuinte"></label> <label>Data inicial
				<input type="date" name="dataInicio" id="dataInicio" aria-label="Date"></label> <label>Data Final
				<input type="date" name="dataFim" id="dataFim" aria-label="Date"></label></div> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/financeiro/entradas/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-c0bqjs"><th scope="col">Contribuinte</th> <th scope="col">Tipo</th> <th scope="col">Valor</th> <th scope="col">Descrição</th> <th scope="col">Data</th> <th scope="col">Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-1sboi7g">Carregando resultados...</tr> `;
    }
    return function(entradas2) {
      return ` ${each(entradas2, (entrada) => {
        return `<tr><td><a href="${"/financeiro/contribuinte/" + escape(entrada.contribuinte.idcontribuinte, true)}">${escape(entrada.contribuinte.nome)} </a></td> ${entrada.contribuinte.trabalhador ? `<td data-svelte-h="svelte-evd7wu">Trabalhador</td>` : `<td data-svelte-h="svelte-4joc18">Eventual</td>`} <td>${escape(Number(entrada.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))}</td> <td>${escape(entrada.descricao)}</td> <td>${escape(dayjs(entrada.data_entrada).format("DD/MM/YYYY"))}</td> <td><a href="${"/financeiro/entradas/" + escape(entrada.identrada, true)}"><i class="fa-solid fa-pen-to-square"></i> </a></td> </tr>`;
      })} `;
    }(__value);
  }(entradas)}</tbody></table> <div class="pagination"><button class="outline" data-svelte-h="svelte-5p59tj"><i class="fa-solid fa-angles-left"></i></button> <button class="outline" data-svelte-h="svelte-1tmcgtt"><i class="fa-solid fa-angle-left"></i></button> <p>Página ${escape(currentPage)} / ${escape(totalPages)}</p> <button class="outline" data-svelte-h="svelte-1mn017k"><i class="fa-solid fa-angle-right"></i></button> <button class="outline" data-svelte-h="svelte-1q3zd23"><i class="fa-solid fa-angles-right"></i></button></div></div>`;
});
export {
  Page as default
};
