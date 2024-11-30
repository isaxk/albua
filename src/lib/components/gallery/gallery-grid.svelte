<script lang="ts">
	import { activePhoto } from '$lib/stores/index.svelte';
	import type { Tables } from '$lib/types/supabase';
	import type { Table } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { quartIn, quartOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import GalleryItem from './gallery-item.svelte';

	let {
		photos,
		members,
		memberPage = false,
		userApp = false
	}: {
		photos: Tables<'photos'>[] | { [key: string]: any }[];
		members: Tables<'party_members'>[] | { [key: string]: any }[];
		memberPage?: boolean;
		userApp?: boolean;
	} = $props();

	const sortedByDate = $derived(
		photos.toSorted((a, b) => {
			if (a.created_at < b.created_at) {
				return 1;
			}
			if (a.created_at > b.created_at) {
				return -1;
			}
			return 0;
		})
	);
</script>

{#if sortedByDate.length > 0 && members.length > 0}
	<div
		class="grid h-full {userApp
			? 'grid-flow-row grid-cols-2 w-full h-max'
			: 'grid-flow-col grid-rows-3 w-max'} min-h-0  min-w-0 gap-3 text-white 2xl:gap-4"
	>
		{#each sortedByDate as item, i (item.id)}
			<div
				animate:flip={{ duration: 400, easing: quartOut }}
				in:fly={{ x: -100, duration: 400, easing: quartOut }}
				out:fly={{ x: -100, duration: 400, easing: quartOut }}
				class="aspect-square h-full w-full {!userApp ? (i === 0 ? 'row-span-3' : 'col-span-3') : ''}"
			>
				<GalleryItem
					onclick={() => {
						activePhoto.value = item;
						activePhoto.memberPage = memberPage;
					}}
					dbId={item.id}
					spotlight={i === 0 && !userApp}
					photoId={item.bucket_file_id}
					date={item.created_at}
					member={members.filter((member) => member.id == item.party_member_id)[0]}
					{memberPage}
					{userApp}
				/>
			</div>
		{/each}
	</div>
{:else}
	<div class="p-3 text-zinc-400">No photos yet!</div>
{/if}
