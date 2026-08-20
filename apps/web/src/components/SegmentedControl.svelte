<script lang="ts">
// N-option sliding segmented control (admin tabs, meal type toggle, etc.).
// Segments hug their own label (not forced to equal widths) so the padding
// around every label stays visually consistent regardless of label length —
// the glass indicator is measured from the active button's real box rather
// than assuming an equal N-way split.
import { onMount } from 'svelte';

type Value = string | number;
type Option = { value: Value; label: string; event?: string; eventProps?: string };

let {
	options,
	value = $bindable(),
	onchange
}: { options: Option[]; value: Value; onchange?: (v: Value) => void } = $props();

const activeIndex = $derived(options.findIndex((o) => o.value === value));

let buttonEls: HTMLButtonElement[] = $state([]);
let glassLeft = $state(0);
let glassWidth = $state(0);

function measure() {
	const el = buttonEls[activeIndex];
	if (!el) return;
	glassLeft = el.offsetLeft;
	glassWidth = el.offsetWidth;
}

$effect(() => {
	activeIndex;
	measure();
});

onMount(() => {
	measure();
	const ro = new ResizeObserver(measure);
	for (const el of buttonEls) if (el) ro.observe(el);
	return () => ro.disconnect();
});

function select(v: Value) {
	value = v;
	onchange?.(v);
}
</script>

<div class="flex justify-center">
	<div class="relative inline-flex rounded-xl bg-muted p-1 h-10 sm:h-11 text-sm sm:text-base">
		<div
			class="absolute left-0 top-1 h-8 sm:h-9 rounded-lg bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] transition-[transform,width] duration-300 ease-out z-0"
			style="width: {glassWidth}px; transform: translateX({glassLeft}px);"
			aria-hidden="true"
		></div>
		{#each options as option, i}
			<button
				bind:this={buttonEls[i]}
				class="relative z-10 px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors duration-150
					{value === option.value ? 'text-foreground' : 'text-muted-foreground pointer:hover:text-foreground'}"
				onclick={() => select(option.value)}
				aria-pressed={value === option.value}
				type="button"
				data-s-event={option.event}
				data-s-event-props={option.eventProps}
			>{option.label}</button>
		{/each}
	</div>
</div>
