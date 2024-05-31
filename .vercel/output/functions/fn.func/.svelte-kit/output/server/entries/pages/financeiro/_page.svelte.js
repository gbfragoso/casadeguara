import { o as onDestroy, c as create_ssr_component, h as spread, j as escape_object, f as add_attribute, v as validate_component, e as escape, i as is_promise, n as noop } from "../../../chunks/ssr.js";
import { Chart as Chart$1, LineController, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from "chart.js";
const eventPrefix = /^on/;
const events = [];
Object.keys(globalThis).forEach((key) => {
  if (eventPrefix.test(key)) {
    events.push(key.replace(eventPrefix, ""));
  }
});
function useForwardEvents(getRef) {
  const destructors = [];
  onDestroy(() => {
    while (destructors.length) {
      destructors.pop()();
    }
  });
}
function clean(props2) {
  let { data: data2, type: type2, options: options2, plugins: plugins2, children, $$scope, $$slots, ...rest } = props2;
  return rest;
}
const Chart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type } = $$props;
  let { data = { datasets: [] } } = $$props;
  let { options = {} } = $$props;
  let { plugins = [] } = $$props;
  let { updateMode = void 0 } = $$props;
  let { chart = null } = $$props;
  let canvasRef;
  let props = clean($$props);
  onDestroy(() => {
    if (chart)
      chart.destroy();
    chart = null;
  });
  useForwardEvents();
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0)
    $$bindings.options(options);
  if ($$props.plugins === void 0 && $$bindings.plugins && plugins !== void 0)
    $$bindings.plugins(plugins);
  if ($$props.updateMode === void 0 && $$bindings.updateMode && updateMode !== void 0)
    $$bindings.updateMode(updateMode);
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0)
    $$bindings.chart(chart);
  return `<canvas${spread([escape_object(props)], {})}${add_attribute("this", canvasRef, 0)}></canvas>`;
});
const Line = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart$1.register(LineController);
  let { chart = null } = $$props;
  let props;
  let baseChartRef;
  useForwardEvents();
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0)
    $$bindings.chart(chart);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    props = $$props;
    $$rendered = `${validate_component(Chart, "Chart").$$render(
      $$result,
      Object.assign({}, { type: "line" }, props, { this: baseChartRef }, { chart }),
      {
        this: ($$value) => {
          baseChartRef = $$value;
          $$settled = false;
        },
        chart: ($$value) => {
          chart = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
function moeda(moeda2) {
  return new Number(moeda2).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let entradasData;
  let saidasData;
  let entradaMesAtual;
  let saidaMesAtual;
  let { data } = $$props;
  Chart$1.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ entradasData, saidasData } = data);
  entradaMesAtual = entradasData.length - 1 >= 0 ? entradasData[entradasData.length - 1] : 0;
  saidaMesAtual = saidasData.length - 1 >= 0 ? saidasData[saidasData.length - 1] : 0;
  return `<hgroup data-svelte-h="svelte-1vsv8tr"><h2 class="pico-color-azure-500">Dashboard</h2> <p>Visão geral da movimentação financeira</p></hgroup> <div class="grid"><div><div class="card"><i class="fa-solid fa-hand-holding-dollar" data-svelte-h="svelte-mnb2o8"> </i>Valor recebido
			<h2 class="pico-color-jade-500">${escape(moeda(entradaMesAtual))}</h2></div> <div class="card"><i class="fa-solid fa-money-bill-transfer" data-svelte-h="svelte-1y9psoq"> </i>Despesas
			<h2 class="pico-color-red-500">${escape(moeda(saidaMesAtual))}</h2></div> <div class="card"><i class="fa-solid fa-sack-dollar" data-svelte-h="svelte-4ykhc1"> </i>Saldo
			<h2 class="pico-color-azure-500">${escape(moeda(entradaMesAtual - saidaMesAtual))}</h2></div></div> <div class="card"><h2 data-svelte-h="svelte-dtn2db">Doações e despesas</h2> ${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return `
			Carregando gráfico
		`;
    }
    return function() {
      return ` ${validate_component(Line, "Line").$$render(
        $$result,
        {
          data: {
            labels: [],
            datasets: [
              {
                label: "Doações",
                fill: true,
                borderColor: "rgb(205, 130, 158)",
                pointBorderColor: "rgb(205, 130,1 58)",
                pointBackgroundColor: "rgb(255, 255, 255)",
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(0, 0, 0)",
                pointHoverBorderColor: "rgba(220, 220, 220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: []
              },
              {
                label: "Despesas",
                fill: true,
                borderColor: "rgb(205, 130, 158)",
                pointBorderColor: "rgb(205, 130,1 58)",
                pointBackgroundColor: "rgb(255, 255, 255)",
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(0, 0, 0)",
                pointHoverBorderColor: "rgba(220, 220, 220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: []
              }
            ]
          },
          options: { responsive: true, animation: false }
        },
        {},
        {}
      )} `;
    }();
  }(saidasData)}</div></div>`;
});
export {
  Page as default
};
