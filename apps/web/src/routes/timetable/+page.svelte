<script lang="ts">
import { useQuery } from 'convex-svelte';
import { api } from "@class-info/backend/convex/_generated/api";
import LoadingState from '../../components/LoadingState.svelte';
import ErrorState from '../../components/ErrorState.svelte';
import EmptyState from '../../components/EmptyState.svelte';
import HScroll from '../../components/HScroll.svelte';
import type { PageData } from './$types.js';

let { data }: { data: PageData } = $props();

const timetableQuery = useQuery(
	api.timetable.get,
	{},
	() => ({ initialData: data.timetable })
);

const dayNames = ['월', '화', '수', '목', '금'];

const periodCount = $derived(timetableQuery.data?.day_time?.length ?? 0);

function getPeriodLabel(period: number): string {
	const times = timetableQuery.data?.day_time || [];
	return times[period - 1] ?? "?";
}
</script>


<svelte:head>
	<title>시간표 - 1학년 6반</title>
	<meta name="description" content="오늘의 시간표를 확인하세요. " />

	<!-- Open Graph -->
	<meta property="og:title" content="시간표 - 1학년 6반" />
	<meta property="og:description" content="오늘의 시간표를 확인하세요. " />
	<meta property="og:url" content="https://school.ohdy.dev/timetable" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="school.ohdy.dev" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="시간표 - 1학년 6반" />
	<meta name="twitter:description" content="오늘의 시간표를 확인하세요. " />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 pt-4 pb-1 sm:pt-5 sm:pb-0 sm:px-4">
	{#if timetableQuery.isLoading}
		<LoadingState />
	{:else if timetableQuery.error}
		<ErrorState error={timetableQuery.error} />
	{:else if !timetableQuery.data}
		<EmptyState />
	{:else}
		<HScroll>
				<table class="w-full min-w-[18rem] table-fixed border border-border border-collapse overflow-hidden rounded-2xl mx-auto">
				<thead>
					<tr class="bg-muted">
						<th class="px-1 py-3 text-center text-base sm:text-lg text-muted-foreground border border-border"> </th>
						{#each dayNames as name}
							<th class="px-1 py-2 text-center text-base font-semibold sm:text-lg text-foreground border border-border">{name}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array(periodCount) as _, i}
						<tr>
							<td class="px-0.5 py-3 sm:py-6 border border-border text-muted-foreground text-center bg-muted">
								<div class="text-sm sm:text-lg font-semibold text-foreground whitespace-nowrap">{i + 1}교시</div>
								<div class="text-[11px] sm:text-base text-muted-foreground tabular-nums leading-tight">{getPeriodLabel(i + 1)}</div>
							</td>
							{#each (timetableQuery.data?.timetable || []) as day}
								<td class="border border-border py-3 sm:py-6 text-center bg-card">
									{#if day[i]?.subject}
										<!-- Subject cell -->
										<div class="flex items-center justify-center gap-2">
											<div>
												<span class="text-[15px] sm:text-xl font-semibold text-foreground">{day[i].subject}</span>
											</div>
										</div>
										<div class="text-sm sm:text-base mt-0.5 font-medium text-muted-foreground">{day[i].teacher}</div>
									{:else}
										<span class="text-muted-foreground/50 text-base sm:text-lg">-</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</HScroll>
		{#if timetableQuery.data}
			<p class="mt-3 text-xs text-muted-foreground pb-10">
				업데이트: {new Date(timetableQuery.data.editedAt).toLocaleString('ko-KR', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})}
			</p>
		{/if}
	{/if}
</div>
