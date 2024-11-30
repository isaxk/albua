<script lang="ts">
	import GalleryGrid from '$lib/components/gallery/gallery-grid.svelte';
	import { createPhotosStore } from '$lib/supabase/database.svelte.js';
	import { dragscroll } from '@svelte-put/dragscroll';
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props();
	console.log(data);

	const photos = createPhotosStore(data.photos, data.party.id, data.member.id);
</script>

{#if data.member}
	<div class="flex h-full flex-col">
		<div class="flex min-h-20 items-center pl-6 text-3xl font-semibold text-zinc-300">
			<a href="../" class="flex h-full w-10 items-center"><ArrowLeft /></a>
			<span class="font-semibold text-white">{data.member.nickname}</span>
			<div>'s photos</div>
		</div>
		<div use:dragscroll class="h-96 min-h-0 flex-grow overflow-x-scroll p-3 pt-0 xl:p-4 xl:pt-0">
			<GalleryGrid photos={photos.photos} members={[data.member]}  memberPage/>
		</div>
	</div>
{/if}
