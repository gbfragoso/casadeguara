import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let livros;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ livros } = data);
  return `<hgroup data-svelte-h="svelte-bcdgmm"><h2 class="pico-color-azure-500">Livros</h2> <p>Consulta de livros</p></hgroup> <div class="card" data-svelte-h="svelte-t5ldfz"><form action="/biblioteca/livros" method="GET"><div class="grid"><label>Tombo:
				<input type="number" name="tombo" id="tombo" placeholder="Digite o tombo do livro"></label> <label>Título:
				<input type="text" name="titulo" id="titulo" placeholder="Digite o título do livro"></label></div> <div class="grid"><label>Autor:
				<input type="text" name="autor" id="autor" placeholder="Digite o nome do autor"></label> <label>Editora:
				<input type="text" name="editora" id="editora" placeholder="Digite o nome da editora"></label> <label>Coleção:
				<input type="text" name="serie" id="serie" placeholder="Digite o nome da coleção"></label></div> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/livros/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-1x926jv"><th>Tombo</th> <th>Título</th> <th>Editora</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-13yuhd9">Carregando lista de livros...</tr> `;
    }
    return function(livros2) {
      return ` ${each(livros2, (livro) => {
        return `<tr><td>${escape(livro.tombo)}</td> <td>${escape(livro.titulo)}</td> <td>${escape(livro.editora_livro_editoraToeditora?.nome || "")}</td> <td><div class="grid" style="width: 60px;"><a href="${"/biblioteca/livros/" + escape(livro.idlivro, true)}"><i class="fa-solid fa-pen-to-square"></i></a> <form action="${"?/excluir&id=" + escape(livro.idlivro, true)}" method="POST"><button data-svelte-h="svelte-svvn3b"><i class="fa-regular fa-trash-can"></i></button></form> </div></td> </tr>`;
      })} `;
    }(__value);
  }(livros)}</tbody></table></div>`;
});
export {
  Page as default
};
