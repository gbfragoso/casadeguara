import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let colecoes;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ colecoes } = data);
  return `<hgroup data-svelte-h="svelte-1gb14iy"><h2 class="pico-color-azure-500">Coleções</h2> <p>Consulta de coleções e séries de livros</p></hgroup> <div class="card" data-svelte-h="svelte-wmrcdk"><form action="/biblioteca/colecoes" method="GET"><label for="nome">Nome da coleção:</label> <input type="text" name="nome" id="nome" placeholder="Digite o nome da coleção"> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/colecoes/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-mlz0s0"><th>Nome</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-10s8n2l">Carregando coleções...</tr> `;
    }
    return function(colecoes2) {
      return ` ${each(colecoes2, (colecao) => {
        return `<tr><td>${escape(colecao.nome)}</td> <td><div class="grid" style="width:60px"><a href="${"/biblioteca/colecoes/" + escape(colecao.idserie, true)}"><i class="fa-solid fa-pen-to-square"></i></a> <form action="${"?/excluir&id=" + escape(colecao.idserie, true)}" method="POST"><button data-svelte-h="svelte-svvn3b"><i class="fa-regular fa-trash-can"></i></button></form> </div></td> </tr>`;
      })} `;
    }(__value);
  }(colecoes)}</tbody></table></div>`;
});
export {
  Page as default
};
