import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let leitores;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ leitores } = data);
  return `<hgroup data-svelte-h="svelte-jdpowu"><h2 class="pico-color-azure-500">Leitores</h2> <p>Consulta de leitores</p></hgroup> <div class="card" data-svelte-h="svelte-y0e6gi"><form action="/biblioteca/leitores" method="GET"><label for="nome">Nome do leitor:</label> <input type="text" name="nome" id="nome" placeholder="Digite o nome do leitor"> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/leitores/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-1rk95by"><th>Nome</th> <th>Trabalhador</th> <th>Status</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-154mfov">Carregando lista de leitores...</tr> `;
    }
    return function(leitores2) {
      return ` ${each(leitores2, (leitor) => {
        return `<tr><td>${escape(leitor.nome)}</td> ${leitor.trab ? `<td data-svelte-h="svelte-15mpvtz">Sim</td>` : `<td data-svelte-h="svelte-1xo2cr2">Não</td>`} ${leitor.status ? `<td data-svelte-h="svelte-48w5sf">Ativo</td>` : `<td data-svelte-h="svelte-agtpj0">Inativo</td>`} <td><a href="${"/biblioteca/leitores/" + escape(leitor.idleitor, true)}"><i class="fa-solid fa-pen-to-square"></i> </a></td> </tr>`;
      })} `;
    }(__value);
  }(leitores)}</tbody></table></div>`;
});
export {
  Page as default
};
