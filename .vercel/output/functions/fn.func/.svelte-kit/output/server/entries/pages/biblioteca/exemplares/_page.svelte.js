import { c as create_ssr_component, d as each, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let exemplares;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ exemplares } = data);
  return `<div data-svelte-h="svelte-19jxmbq">Consulta de exemplares</div> <form action="/biblioteca/exemplares" method="GET"><label for="titulo" data-svelte-h="svelte-qmcgxe">Título</label> <input type="text" name="titulo" id="titulo"> <label for="tombo" data-svelte-h="svelte-1xxjcvs">Tombo</label> <input type="text" name="tombo" id="tombo"> <select name="status" id="status"><option value="Disponível" data-svelte-h="svelte-1tawtqi">Disponível</option><option value="Emprestado" data-svelte-h="svelte-1tznc1q">Emprestado</option></select> <button data-svelte-h="svelte-18zxgd9">Pesquisar</button></form> <a href="/biblioteca/exemplares/novo" data-svelte-h="svelte-140jrrn"><button>Novo</button></a> <table><thead data-svelte-h="svelte-84it2y"><th>Tombo</th> <th>Título</th> <th>Ex</th> <th>Status</th> <th>Ações</th></thead> <tbody>${each(exemplares, (exemplar) => {
    return `<tr><td>${escape(exemplar.livro_exemplar_livroTolivro.tombo)}</td> <td>${escape(exemplar.livro_exemplar_livroTolivro.titulo)}</td> <td>${escape(exemplar.numero)}</td> <td>${escape(exemplar.status)}</td> <td><a href="${"/biblioteca/exemplares/" + escape(exemplar.idexemplar, true)}"><i class="fa-solid fa-pen-to-square" data-svelte-h="svelte-7r8ho8">Editar</i></a> <form action="${"?/excluir&id=" + escape(exemplar.idexemplar, true)}" method="POST"><button data-svelte-h="svelte-10u7w1t"><i class="fa-regular fa-trash-can">Excluir</i></button> </form></td> </tr>`;
  })}</tbody></table>`;
});
export {
  Page as default
};
