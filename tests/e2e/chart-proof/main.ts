import { mount, unmount } from 'svelte';

import ChartProof from './ChartProof.svelte';

const target = document.querySelector<HTMLElement>('#proof-target');
if (!target) throw new Error('Chart proof target is missing.');

const nextPaint = () =>
	new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});

const firstInstance = mount(ChartProof, { target });
document.documentElement.dataset.proofMounted = 'true';
await nextPaint();
unmount(firstInstance);
document.documentElement.dataset.proofUnmounted = 'true';
await nextPaint();
mount(ChartProof, { target });
document.documentElement.dataset.proofRemounted = 'true';
