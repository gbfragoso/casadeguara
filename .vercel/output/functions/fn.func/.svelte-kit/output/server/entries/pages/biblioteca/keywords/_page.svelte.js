import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let keywords;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ keywords } = data);
  return `<hgroup data-svelte-h="svelte-1o89z9q"><h2 class="pico-color-azure-500">Palavras-chave</h2> <p>Consulta de palavras-chave</p></hgroup> <div class="card" data-svelte-h="svelte-nhcpyl"><form action="/biblioteca/keywords" method="GET"><label for="chave">Palavra-chave:</label> <input type="text" name="chave" id="chave" placeholder="Digite uma tema ou palavra-chave"> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/keywords/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-mlz0s0"><th>Nome</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-zojkck">Carregando lista de palavras-chave</tr> `;
    }
    return function(keywords2) {
      return ` ${each(keywords2, (keyword) => {
        return `<tr><td>${escape(keyword.chave)}</td> <td><div class="grid" style="width: 60px"><a href="${"/biblioteca/keywords/" + escape(keyword.idkeyword, true)}"><i class="fa-solid fa-pen-to-square"></i></a> <form action="${"?/excluir&id=" + escape(keyword.idkeyword, true)}" method="POST"><button data-svelte-h="svelte-svvn3b"><i class="fa-regular fa-trash-can"></i></button></form> </div></td> </tr>`;
      })} `;
    }(__value);
  }(keywords)}</tbody></table></div>`;
});
export {
  Page as default
};
