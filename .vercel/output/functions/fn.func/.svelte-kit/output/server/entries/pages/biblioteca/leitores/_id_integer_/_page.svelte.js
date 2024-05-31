import { c as create_ssr_component, f as add_attribute } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let leitor;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ leitor } = data);
  return `<form action="?/update" method="POST"><fieldset><label for="nome" data-svelte-h="svelte-1ele7r6">Nome</label> <input type="text" name="nome" id="nome"${add_attribute("value", leitor.nome, 0)}> <label for="rg" data-svelte-h="svelte-1led602">RG</label> <input type="text" name="rg" id="rg"${add_attribute("value", leitor.rg, 0)}> <label for="rg" data-svelte-h="svelte-13e3ey8">CPF</label> <input type="text" name="cpf" id="cpf"${add_attribute("value", leitor.cpf, 0)}> <label for="email" data-svelte-h="svelte-ff8mj9">E-mail</label> <input type="text" name="email" id="email"${add_attribute("value", leitor.email, 0)}> <label for="celular" data-svelte-h="svelte-80gpte">Celular</label> <input type="text" name="celular" id="celular"${add_attribute("value", leitor.celular, 0)}> <label for="telefone" data-svelte-h="svelte-1ash96q">Telefone</label> <input type="text" name="telefone" id="telefone"${add_attribute("value", leitor.telefone, 0)}> <label for="logradouro" data-svelte-h="svelte-1ilr2xq">Logradouro</label> <input type="text" name="logradouro" id="logradouro"${add_attribute("value", leitor.logradouro, 0)}> <label for="bairro" data-svelte-h="svelte-186uqla">Bairro</label> <input type="text" name="bairro" id="bairro"${add_attribute("value", leitor.bairro, 0)}> <label for="complemento" data-svelte-h="svelte-12vyabc">Complemento</label> <input type="text" name="complemento" id="complemento"${add_attribute("value", leitor.complemento, 0)}> <label for="cidade" data-svelte-h="svelte-18tug1e">Cidade</label> <input type="text" name="cidade" id="cidade"${add_attribute("value", leitor.cidade, 0)}> <label for="cep" data-svelte-h="svelte-1jmg0jm">CEP</label> <input type="text" name="cep" id="cep"${add_attribute("value", leitor.cep, 0)}> <span><input type="checkbox" name="trab" id="trab" ${leitor.trab ? "checked" : ""}>Trabalhador
			<input type="checkbox" name="status" id="status" ${leitor.status ? "checked" : ""}>Ativo</span></fieldset> <button data-svelte-h="svelte-1d55ymx">Atualizar</button></form>`;
});
export {
  Page as default
};
