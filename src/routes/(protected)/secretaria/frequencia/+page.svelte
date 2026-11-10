<script lang="ts">
	import { resolve } from '$app/paths';
	import type { AttendancePeriod } from '#lib/attendance/dates.js';
	import { ATTENDANCE_READY_LABEL, buildAttendanceFileName } from '#lib/attendance/format.js';
	import { requestAttendancePdf } from '#lib/attendance/request.js';
	import Button from '#lib/components/actions/Button.svelte';
	import PdfOutcome from '#lib/components/feedback/PdfOutcome.svelte';
	import AttendanceListFields from '#lib/components/forms/AttendanceListFields.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { readFormSearchParams } from '#lib/forms/search-params.js';
	import { PdfDelivery } from '#lib/pdf/delivery.svelte.js';
	import type { PdfMessageFailure } from '#lib/pdf/request.js';
	import {
		parseAttendanceListRequest,
		type AttendanceField,
		type AttendanceListIssue,
	} from '#lib/validation/pdf/attendance-list.js';

	const FIELD_CONTROLS: Record<AttendanceField, string> = { titulo: 'titulo', periodo: 'dataFim', dias: 'dias' };

	const attendancePdf = new PdfDelivery<AttendancePeriod, PdfMessageFailure>();
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Frequência', href: resolve('secretaria/frequencia') },
	];
	let issues = $state.raw<AttendanceListIssue[]>([]);

	const focusFirstInvalidControl = (form: HTMLFormElement, [first]: AttendanceListIssue[]) => {
		form.querySelector<HTMLInputElement>(`[name="${FIELD_CONTROLS[first.field]}"]`)?.focus();
	};

	function generatePdf(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const params = readFormSearchParams(event.currentTarget);
		const parsed = parseAttendanceListRequest(params);
		if (!parsed.success) {
			issues = parsed.issues;
			focusFirstInvalidControl(event.currentTarget, parsed.issues);
			return;
		}
		issues = [];
		const { period } = parsed.data;
		return attendancePdf.deliver(period, (signal) => requestAttendancePdf(fetch, { params, period }, signal));
	}

	const releaseOnUnmount = () => () => attendancePdf.release();
</script>

<PageHeader {breadcrumb} printTitle={false} title="Lista de frequência" />

<Card
	element="form"
	novalidate
	class="flex flex-col gap-5"
	onsubmit={generatePdf}
	oninput={() => attendancePdf.reset()}>
	<AttendanceListFields {issues} />
	<div>
		<Button type="submit" tone="primary" bold class="tablet:min-w-50">
			<i class="fa-solid fa-file-pdf fa-fw" aria-hidden="true"></i>Gerar PDF
		</Button>
	</div>
</Card>

{#if attendancePdf.current.status !== 'idle'}
	<div class="mt-6 flex flex-col gap-3 print:hidden" {@attach releaseOnUnmount}>
		<PdfOutcome
			outcome={attendancePdf.current}
			loadingLabel="Gerando o PDF…"
			readyLabel={ATTENDANCE_READY_LABEL}
			fileName={buildAttendanceFileName(attendancePdf.current.subject)} />
	</div>
{/if}
