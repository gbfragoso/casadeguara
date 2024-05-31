import { c as create_ssr_component, b as subscribe, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let contribuintes;
  let total;
  let currentPage;
  let totalPages;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ contribuintes, total } = data);
  currentPage = 1;
  totalPages = Math.ceil(total / 10);
  $$unsubscribe_page();
  return `<hgroup data-svelte-h="svelte-1a4d91g"><h2 class="pico-color-azure-500">Contribuintes</h2> <p>Consulta de contribuintes</p></hgroup> <div class="card" data-svelte-h="svelte-n14q0c"><form action="/financeiro/contribuintes" method="GET"><label style="width: 100%">Nome do contribuinte
			<input type="search" name="nome" id="nome" placeholder="Digite o nome do contribuinte"></label> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/financeiro/contribuintes/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-44moc"><th scope="col">Contribuinte</th> <th scope="col">Tipo</th> <th scope="col">Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-1kyvp99">Carregando lista de contribuintes</tr> `;
    }
    return function() {
      return ` ${each(contribuintes, (contribuinte) => {
        return `<tr><td>${escape(contribuinte.nome)}</td> ${contribuinte.trabalhador ? `<td data-svelte-h="svelte-evd7wu">Trabalhador</td>` : `<td data-svelte-h="svelte-4joc18">Eventual</td>`} <td><form method="POST"><a href="${"/financeiro/contribuintes/" + escape(contribuinte.idcontribuinte, true)}"><i class="fa-solid fa-pen-to-square"></i></a> </form></td> </tr>`;
      })} `;
    }();
  }(contribuintes)}</tbody></table> <div class="pagination"><button class="outline" data-svelte-h="svelte-5p59tj"><i class="fa-solid fa-angles-left"></i></button> <button class="outline" data-svelte-h="svelte-1tmcgtt"><i class="fa-solid fa-angle-left"></i></button> <p>Página ${escape(currentPage)} / ${escape(totalPages)}</p> <button class="outline" data-svelte-h="svelte-1mn017k"><i class="fa-solid fa-angle-right"></i></button> <button class="outline" data-svelte-h="svelte-1q3zd23"><i class="fa-solid fa-angles-right"></i></button></div></div>`;
});
export {
  Page as default
};
