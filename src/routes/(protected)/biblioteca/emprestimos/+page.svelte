<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import Notification from '#lib/components/feedback/Notification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import type { Tone } from '#lib/components/feedback/tone.js';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import ChoiceGroup from '#lib/components/forms/ChoiceGroup.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Column from '#lib/components/layout/Column.svelte';
	import Columns from '#lib/components/layout/Columns.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	type LoanStatus = { label: string; kind?: Tone };
	type LoanUpdate = {
		status?: LoanStatus;
		dueDate?: string;
		returnHidden?: boolean;
		renewal?: 'disabled' | 'hidden';
	};
	type Loan = { data_devolvido: Date | null; data_devolucao: Date };

	const RETURNED: LoanStatus = { label: 'Devolvido' };
	const LATE: LoanStatus = { label: 'Atrasado', kind: 'warning' };
	const ACTIVE: LoanStatus = { label: 'Ativo', kind: 'info' };
	const RENEWED: LoanStatus = { label: 'Renovado', kind: 'success' };
	const RETURN_FAILED: LoanStatus = { label: 'Erro ao devolver', kind: 'danger' };
	const RENEWAL_FAILED: LoanStatus = { label: 'Erro ao renovar', kind: 'danger' };

	let { data, form }: Props = $props();
	let { isAdmin } = $derived(data);
	let loanUpdates: Record<number, LoanUpdate> = $state({});
	const formEnhancer = createFormEnhancer({
		afterUpdate: () => {
			loanUpdates = {};
		},
	});
	const breadcrumb = [
		{ label: 'Biblioteca', href: resolve('biblioteca') },
		{ label: 'Empréstimos', href: resolve('biblioteca/emprestimos') },
	];

	const formatDate = (date: Date | string) => dayjs.utc(date).format('DD/MM/YYYY');

	const currentStatus = (loan: Loan) => {
		if (loan.data_devolvido) return RETURNED;
		if (dayjs().isAfter(dayjs(loan.data_devolucao).add(1, 'day'))) return LATE;
		return ACTIVE;
	};

	const updateLoan = (id: number, update: LoanUpdate) => {
		loanUpdates[id] = { ...loanUpdates[id], ...update };
	};

	async function returnLoan(id: number) {
		updateLoan(id, { returnHidden: true });
		const response = await fetch(`/api/biblioteca/devolucao?id=${id}`, { method: 'POST' });
		updateLoan(id, { status: response.status === 200 ? RETURNED : RETURN_FAILED });
	}

	async function renewLoan(id: number) {
		updateLoan(id, { renewal: isAdmin ? 'disabled' : 'hidden' });
		const response = await fetch(`/api/biblioteca/renovacao?id=${id}`, { method: 'POST' });
		if (response.status !== 200) {
			updateLoan(id, { status: RENEWAL_FAILED });
			return;
		}
		updateLoan(id, { status: RENEWED, dueDate: formatDate(await response.text()) });
	}
	dayjs.extend(utc);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-hand-holding">Consulta de empréstimos</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-5" {@attach formEnhancer.submitWithLoading}>
	<Field id="leitor" label="Leitor">
		{#snippet control()}
			<TextInput type="text" name="leitor" id="leitor" placeholder="Digite o nome do leitor" />
		{/snippet}
	</Field>
	<Columns>
		<Column>
			<Field id="tombo" label="Tombo">
				{#snippet control()}
					<TextInput type="number" name="tombo" id="tombo" placeholder="Digite o tombo" />
				{/snippet}
			</Field>
		</Column>
		<Column>
			<Field id="titulo" label="Título">
				{#snippet control()}
					<TextInput type="text" name="titulo" id="titulo" placeholder="Digite o título da obra" />
				{/snippet}
			</Field>
		</Column>
	</Columns>
	<ChoiceGroup>
		<Checkbox name="ativos" id="ativos" checked>Somente ativos</Checkbox>
		<Checkbox name="atrasados" id="atrasados">Somente atrasados</Checkbox>
	</ChoiceGroup>
	<ButtonGroup>
		<Button type="submit" tone="primary" loading={formEnhancer.loading} bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('biblioteca/emprestimos/novo')} tone="warning" bold class="tablet:min-w-40">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
</Card>

{#if form?.emprestimos}
	<Card class="mt-6 overflow-hidden" padded={false}>
		<DataTable>
			{#snippet head()}
				<tr>
					<th>Leitor</th>
					<th>Título</th>
					<th>Ex</th>
					<th>Prazo</th>
					<th>Status</th>
					<th class="print:hidden">Ações</th>
				</tr>
			{/snippet}
			{#each form.emprestimos as emprestimo (emprestimo.idemp)}
				{@const update = loanUpdates[emprestimo.idemp] ?? {}}
				{@const status = update.status ?? currentStatus(emprestimo)}
				<tr>
					<td>
						<a
							href={resolve('/(protected)/biblioteca/leitores/[id=integer]', {
								id: `${emprestimo.idleitor}`,
							})}>{emprestimo.leitor}</a>
					</td>
					<td>{emprestimo.titulo}</td>
					<td class="tabular-nums">{emprestimo.numero}</td>
					<td id={`${emprestimo.idemp}devolucao`} class="tabular-nums"
						>{update.dueDate ?? formatDate(emprestimo.data_devolucao)}</td>
					<td><Tag id={`${emprestimo.idemp}`} kind={status.kind}>{status.label}</Tag></td>
					<td class="print:hidden">
						<div class="flex gap-1">
							{#if !emprestimo.data_devolvido}
								<IconAction
									icon="fa-regular fa-pen-to-square"
									href={resolve('/(protected)/biblioteca/emprestimos/[id=integer]', {
										id: `${emprestimo.idemp}`,
									})}
									title="Editar"
									aria-label="Editar" />
								{#if (Number(emprestimo.renovacoes) < 1 || isAdmin) && update.renewal !== 'hidden'}
									<IconAction
										id={`renovar-${emprestimo.idemp}`}
										icon="fa-solid fa-repeat"
										disabled={update.renewal === 'disabled'}
										onclick={() => renewLoan(emprestimo.idemp)}
										title="Renovar"
										aria-label="Renovar" />
								{/if}
								{#if !update.returnHidden}
									<IconAction
										id={`devolver-${emprestimo.idemp}`}
										icon="fa-solid fa-reply"
										onclick={() => returnLoan(emprestimo.idemp)}
										title="Devolver"
										aria-label="Devolver" />
								{/if}
							{/if}
							<IconAction
								icon="fa-regular fa-file-lines"
								href={resolve('/(protected)/biblioteca/emprestimos/[id=integer]/recibo', {
									id: `${emprestimo.idemp}`,
								})}
								title="Recibo"
								aria-label="Recibo" />
						</div>
					</td>
				</tr>
			{/each}
		</DataTable>
	</Card>
{/if}
{#if form?.status === 201}
	<Notification kind="success">{form.message}</Notification>
{/if}
{#if form?.status === 400 && form?.message}
	<Notification kind="danger">{form.message}</Notification>
{/if}
