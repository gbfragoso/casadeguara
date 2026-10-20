import { createRawSnippet, mount, tick, unmount, type Component } from 'svelte';
import { afterEach } from 'vitest';

let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
});

export const htmlSnippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

export async function renderComponent<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props: Props,
) {
	const target = document.createElement('div');
	document.body.append(target);
	mounted = mount(component, { target, props });
	await tick();
	return target;
}

export function getElement<Element extends HTMLElement>(
	container: ParentNode,
	selector: string,
	type: new () => Element,
) {
	const element = container.querySelector(selector);
	if (!(element instanceof type)) throw new Error(`Elemento não renderizado: ${selector}`);
	return element;
}
