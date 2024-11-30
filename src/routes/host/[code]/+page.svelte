<script lang="ts">
	import GalleryGrid from '$lib/components/gallery/gallery-grid.svelte';
	import { user } from '$lib/supabase/auth.svelte';
	import {
		createMembersStore,
		createPhotosStore
	} from '$lib/supabase/database.svelte';
	import { dragscroll } from '@svelte-put/dragscroll';

	let { data } = $props();

	const photos = createPhotosStore(data.photos, data.party.id);
	const members = createMembersStore(data.members, data.party.id);
</script>

{#if data.party.host_user_id === user.user?.id}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		use:dragscroll
		class="flex h-full flex-grow gap-3 overflow-x-scroll bg-zinc-950 p-3 text-white 2xl:gap-4 2xl:p-4"
	>
		<GalleryGrid photos={photos.photos} members={members.members} />
	</div>
{/if}
