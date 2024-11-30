<script lang="ts">
	import { user } from '$lib/supabase/auth.svelte';
	import { onMount } from 'svelte';
	import { qr } from '@svelte-put/qr/svg';
	import Spotlight from '$lib/components/gallery/spotlight.svelte';
	import GalleryItem from '$lib/components/gallery/gallery-item.svelte';
	import {
	createPhotosStore,
		getMembers,
		getPhotos,
		onPhotosUpdate
	} from '$lib/supabase/database.svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { dragscroll } from '@svelte-put/dragscroll';
	import { quartIn, quartOut } from 'svelte/easing';
	import { activePhoto } from '$lib/stores/index.svelte';
	import GalleryGrid from '$lib/components/gallery/gallery-grid.svelte';
	import type { Tables } from '$lib/types/supabase.js';

	let { data } = $props();

	const photos = createPhotosStore(data.photos, data.party.id);

	let members: Tables<"party_members">[] = $state(data.members);

</script>

{#if data.party.host_user_id === user.user?.id}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		use:dragscroll
		class="flex h-full flex-grow gap-3 overflow-x-scroll bg-zinc-950 p-3 text-white 2xl:gap-4 2xl:p-4"
	>
		<GalleryGrid photos={photos.photos} members={members} />
	</div>
{/if}
