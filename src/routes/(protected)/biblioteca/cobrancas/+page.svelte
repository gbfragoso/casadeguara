<script lang="ts">
	import { resolve } from '$app/paths';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import SkeletonLines from '#lib/components/feedback/SkeletonLines.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { enhanceForm } from '#lib/forms/enhancer.svelte.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	type Loan = { idemp: number; leitor: string; titulo: string };
	type Contact = { action: '?/whatsapp' | '?/email'; field: 'telefone' | 'email'; value: string; icon: string };

	let { data }: Props = $props();
	let { emprestimos } = $derived(data);
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Empréstimos', href: resolve('biblioteca/emprestimos') },
	];
	dayjs.extend(utc);
</script>

{#snippet contactForm(loan: Loan, dueDate: string, contact: Contact)}
	<form action={contact.action} method="POST" {@attach enhanceForm}>
		<input type="hidden" name="id" value={loan.idemp} />
		<input type="hidden" name="leitor" value={loan.leitor} />
		<input type="hidden" name="titulo" value={loan.titulo} />
		<input type="hidden" name={contact.field} value={contact.value} />
		<input type="hidden" name="prazo" value={dueDate} />
		<IconAction type="submit" icon={contact.icon} aria-label="Whatsapp" title="Whatsapp" />
	</form>
{/snippet}

<PageHeader {breadcrumb} icon="fa-solid fa-envelopes-bulk">Empréstimos em atraso</PageHeader>

<Card id="printable-content" class="notranslate overflow-hidden" translate="no" padded={false}>
	<DataTable>
		{#snippet head()}
			<tr>
				<th>Leitor</th>
				<th>Título</th>
				<th>Ex</th>
				<th>Prazo</th>
				<th>Cobrança</th>
				<th class="print:hidden">Ações</th>
			</tr>
		{/snippet}
		{#await emprestimos}
			<tr>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
				<td><SkeletonLines /></td>
			</tr>
		{:then item}
			{#each item as emprestimo (emprestimo.idemp)}
				{@const dueDate = dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}
				<tr>
					<td>
						<a
							href={resolve('/(protected)/biblioteca/leitores/[id=integer]', {
								id: `${emprestimo.idleitor}`,
							})}>{emprestimo.leitor}</a>
					</td>
					<td>{emprestimo.titulo}</td>
					<td class="tabular-nums">{emprestimo.numero}</td>
					<td class="tabular-nums">{dueDate}</td>
					<td>
						{#if emprestimo.cobranca}
							<Tag kind="success">{dayjs.utc(emprestimo.cobranca).format('DD/MM/YYYY')}</Tag>
						{:else}
							<Tag kind="warning">Não cobrado</Tag>
						{/if}
					</td>
					<td class="print:hidden">
						<div class="flex gap-1">
							{#if emprestimo.telefone}
								{@render contactForm(emprestimo, dueDate, {
									action: '?/whatsapp',
									field: 'telefone',
									value: emprestimo.telefone,
									icon: 'fa-brands fa-whatsapp',
								})}
							{/if}
							{#if emprestimo.celular}
								{@render contactForm(emprestimo, dueDate, {
									action: '?/whatsapp',
									field: 'telefone',
									value: emprestimo.celular,
									icon: 'fa-brands fa-whatsapp',
								})}
							{/if}
							{#if emprestimo.email}
								{@render contactForm(emprestimo, dueDate, {
									action: '?/email',
									field: 'email',
									value: emprestimo.email,
									icon: 'fa-regular fa-envelope',
								})}
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		{/await}
	</DataTable>
</Card>
