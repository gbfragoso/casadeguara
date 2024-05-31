import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let autores;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ autores } = data);
  return `<hgroup data-svelte-h="svelte-glsvt0"><h2 class="pico-color-azure-500">Autores</h2> <p>Consulta de autores</p></hgroup> <div class="card" data-svelte-h="svelte-1t5ug1e"><form action="/biblioteca/autores" method="GET"><label for="nome">Nome do autor:</label> <input type="text" name="nome" id="nome" placeholder="Digite o nome do autor"> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/autores/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead class="pico-background-azure-500" data-svelte-h="svelte-932fpd"><th>Nome</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-tby1xd">Carregando autores...</tr> `;
    }
    return function() {
      return ` ${each(autores, (autor) => {
        return `<tr><td>${escape(autor.nome)}</td> <td><a href="${"/biblioteca/autores/" + escape(autor.idautor, true)}"><i class="fa-solid fa-pen-to-square"></i> </a></td> </tr>`;
      })} `;
    }();
  }(autores)}</tbody></table></div>`;
});
export {
  Page as default
};
