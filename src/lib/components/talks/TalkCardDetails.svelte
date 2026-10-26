<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import InlineEditField from '#lib/components/forms/InlineEditField.svelte';
	import TalkFieldLabel from '#lib/components/talks/TalkFieldLabel.svelte';
	import { hasDefaultLocationAndActivities } from '#lib/talks/defaults.js';
	import type { TalkCard } from '#lib/talks/types.js';
	import type { TalkChange } from '#lib/validation/comunicacao/palestras.js';

	type FieldProps = Omit<ComponentProps<typeof InlineEditField>, 'label' | 'value'>;
	type Props = {
		talk: TalkCard;
		readonly: boolean;
		fieldProps: (campo: TalkChange['campo']) => FieldProps;
		open?: boolean;
	};

	let { talk, readonly, fieldProps, open = $bindable(false) }: Props = $props();

	const status = $derived(hasDefaultLocationAndActivities(talk) ? 'padrão' : 'alterado');
</script>

<details bind:open class="group">
	<summary
		class="-mx-2 flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
		<i
			class="fa-solid fa-chevron-right fa-fw transition-transform group-open:rotate-90 motion-reduce:transition-none"
			aria-hidden="true"></i>
		<span>Local e reunião com <span class="font-normal">· {status}</span></span>
	</summary>
	<div class="mt-1 flex flex-col gap-3">
		<div>
			<TalkFieldLabel icon="fa-solid fa-location-dot" text="Local" />
			<InlineEditField {...fieldProps('local')} label="Local" value={talk.local} />
		</div>
		<div>
			<TalkFieldLabel icon="fa-solid fa-list-ul" text="Reunião com" />
			<InlineEditField
				{...fieldProps('reuniaoCom')}
				label="Reunião com"
				type="textarea"
				value={talk.reuniaoCom.join('\n')}
				help={readonly ? undefined : 'Uma atividade por linha'} />
		</div>
	</div>
</details>
