import { c as create_ssr_component, i as is_promise, n as noop, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let editoras;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ editoras } = data);
  return `<hgroup data-svelte-h="svelte-103ayna"><h2 class="pico-color-azure-500">Editoras</h2> <p>Consulta de editoras</p></hgroup> <div class="card" data-svelte-h="svelte-asprtr"><form action="/biblioteca/editoras" method="GET"><input type="text" name="nome" id="nome"> <div class="flex-container" style="width: 25%"><button class="outline" type="submit"><i class="fa-solid fa-magnifying-glass"> </i>Pesquisar</button> <a href="/biblioteca/editoras/novo" style="width: 100%"><button class="primary"><i class="fa-solid fa-plus"> </i>Novo</button></a></div></form></div> <div class="card overflow-auto"><table class="striped"><thead data-svelte-h="svelte-mlz0s0"><th>Nome</th> <th>Ações</th></thead> <tbody>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ` <tr data-svelte-h="svelte-30vcg1">Carregando editoras...</tr> `;
    }
    return function(editoras2) {
      return ` ${each(editoras2, (editora) => {
        return `<tr><td>${escape(editora.nome)}</td> <td><div class="grid" style="width:60px"><a href="${"/biblioteca/editoras/" + escape(editora.ideditora, true)}"><i class="fa-solid fa-pen-to-square"></i></a> <form action="${"?/excluir&id=" + escape(editora.ideditora, true)}" method="POST"><button data-svelte-h="svelte-svvn3b"><i class="fa-regular fa-trash-can"></i></button></form> </div></td> </tr>`;
      })} `;
    }(__value);
  }(editoras)}</tbody></table></div>`;
});
export {
  Page as default
};
