<script lang="ts">
import { useQuery } from 'convex-svelte';
import { api } from "@class-info/backend/convex/_generated/api";
import NoticeGroup from '../../components/NoticeGroup.svelte';
import NoticeCard from '../../components/NoticeCard.svelte';
import PastMonthDetails from '../../components/PastMonthDetails.svelte';
import SegmentedControl from '../../components/SegmentedControl.svelte';
import LoadingState from '../../components/LoadingState.svelte';
import ErrorState from '../../components/ErrorState.svelte';
import EmptyState from '../../components/EmptyState.svelte';
import NoticeFooter from '../../components/NoticeFooter.svelte';
import type { PageData } from './$types.js';

let { data }: { data: PageData } = $props();
let openMonthKey = $state<string | null>(null);
let activeView = $state<'dated' | 'standing'>('dated');

const overview = useQuery(api.notices.overview, {}, () => ({
    initialData: data,
    keepPreviousData: true,
}));

const standing = useQuery(api.notices.standingNotices, {}, () => ({
    initialData: data.standingNotices,
    keepPreviousData: true,
}));
</script>

<svelte:head>
	<title>공지 - 1학년 6반</title>
	<meta name="description" content="수행평가 등 오늘의 공지 사항을 확인하세요." />

	<!-- Open Graph -->
	<meta property="og:title" content="공지 - 1학년 6반" />
	<meta property="og:description" content="수행평가 등 오늘의 공지 사항을 확인하세요." />
	<meta property="og:url" content="https://school.ohdy.dev/notices" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="school.ohdy.dev" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="공지 - 1학년 6반" />
	<meta name="twitter:description" content="수행평가 등 오늘의 공지 사항을 확인하세요." />
</svelte:head>


<div class="max-w-4xl mx-auto px-4 pt-5 pb-4 sm:pt-6">
	<div class="mb-4 sm:mb-6">
		<SegmentedControl
			bind:value={activeView}
			options={[
				{ value: 'dated', label: '마감 공지' },
				{ value: 'standing', label: '상시 공지' }
			]}
		/>
	</div>

	<!-- Notice Board -->
    {#if activeView === 'dated'}
    {#if overview.isLoading}
        <LoadingState />
    {:else if overview.error}
        <ErrorState error={overview.error} />
    {:else}
        <!-- Current and Future Notices -->
        {#if overview.data?.currentGroups && overview.data.currentGroups.length > 0}
            {#each overview.data.currentGroups as group}
                <NoticeGroup {group} />
            {/each}
        {:else}
            <EmptyState />
        {/if}

        {#if overview.data?.pastMonths && overview.data.pastMonths.length > 0}
            <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                <h2 class="text-base sm:text-lg font-semibold tracking-tight mb-2 sm:mb-3 text-muted-foreground">지난 알림</h2>
                {#each overview.data.pastMonths as month (month.monthKey)}
                    <details class="mb-1.5 sm:mb-2 bg-card border border-border rounded-xl overflow-hidden" open={openMonthKey === month.monthKey}>
                        <summary
                            class="px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors pointer:hover:bg-muted text-muted-foreground font-medium text-sm sm:text-base tabular-nums"
                            onclick={(e) => {
                                e.preventDefault();
                                openMonthKey = openMonthKey === month.monthKey ? null : month.monthKey;
                            }}
                        >
                            {month.monthName} ({month.total}개)
                        </summary>
                        {#if openMonthKey === month.monthKey}
                            {#key month.monthKey}
                                <PastMonthDetails monthKey={month.monthKey} />
                            {/key}
                        {/if}
                    </details>
                {/each}
            </div>
        {/if}
        {#if (!overview.data?.currentGroups || overview.data.currentGroups.length === 0) && (!overview.data?.pastMonths || overview.data.pastMonths.length === 0)}
            <EmptyState />
        {/if}
    {/if}
    <NoticeFooter notices={overview.data?.currentGroups || []} />
    {:else}
    {#if standing.isLoading}
        <LoadingState />
    {:else if standing.error}
        <ErrorState error={standing.error} />
    {:else if standing.data && standing.data.length > 0}
        <div class="grid gap-1.5 sm:gap-2">
            {#each standing.data as notice (notice._id)}
                <NoticeCard {notice} />
            {/each}
        </div>
    {:else}
        <EmptyState />
    {/if}
    {/if}
</div>
