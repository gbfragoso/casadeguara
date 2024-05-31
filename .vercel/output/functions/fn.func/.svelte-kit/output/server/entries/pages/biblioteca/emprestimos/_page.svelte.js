import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
import dayjs from "dayjs";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let emprestimos;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ emprestimos } = data);
  return `<hgroup data-svelte-h="svelte-1v3eo42"><h2 class="pico-color-azure-500">Empréstimos</h2> <p>Consulta de empréstimos</p></hgroup> <div class="card" data-svelte-h="svelte-ckbqjf"><form action="/biblioteca/emprestimos" method="GET"><div class="grid"><label>Leitor:
				<input type="text" name="leitor" id="leitor" placeholder="Digite o nome do leitor"></label> <label>Títuto:
				<input type="text" name="titulo" id="titulo" placeholder="Digite o título da obra"></label></div> <div class="flex-container"><label>Somente ativos
				<input type="checkbox" name="ativos" id="ativos" checked></label> <label>Somente atrasados
				<input type="checkbox" name="atrasados" id="atrasados"></label></div> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/emprestimos/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-1oa2tee"><th>Leitor</th> <th>Título</th> <th>Ex</th> <th>Empréstimo</th> <th>Prazo</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-1hio6ci">Carregando lista de empréstimos</tr> `;
    }
    return function(emprestimos2) {
      return ` ${each(emprestimos2, (emprestimo) => {
        return `<tr><td><a href="${"/biblioteca/leitores/" + escape(emprestimo.leitor_emprestimo_leitorToleitor.idleitor, true)}">${escape(emprestimo.leitor_emprestimo_leitorToleitor.nome)} </a></td> <td>${escape(emprestimo.exemplar_emprestimo_exemplarToexemplar.livro_exemplar_livroTolivro.titulo)}</td> <td>${escape(emprestimo.exemplar_emprestimo_exemplarToexemplar.numero)}</td> <td>${escape(dayjs(emprestimo.data_emprestimo).format("DD/MM/YYYY"))}</td> <td>${escape(dayjs(emprestimo.data_devolucao).format("DD/MM/YYYY"))}</td> </tr>`;
      })} `;
    }(__value);
  }(emprestimos)}</tbody></table></div>`;
});
export {
  Page as default
};
