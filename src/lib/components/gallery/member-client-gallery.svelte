<script lang="ts">
	import { getPhotos } from '$lib/supabase/database.svelte';
	import type { Tables } from '$lib/types/supabase';
	import { X, type Table } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { Drawer } from 'vaul-svelte';
	import GalleryGrid from './gallery-grid.svelte';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabase/init';
	import { user } from '$lib/supabase/auth.svelte';

	let {
		party,
		member,
		open = $bindable()
	}: {
		party: Tables<'parties'>;
		member: Tables<'party_members'>;
		open: boolean;
	} = $props();
	let photos: Tables<'photos'>[] | { [key: string]: any; }[] = $state([]);


	onMount(async () => {
		photos = await getPhotos(party.id, member.id);
		const photosSubscribe = supabase
		.channel('photos-insert')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'photos', filter: `user_id=eq.${user.user?.id}` },
			(payload) => {
				console.log(payload, member.id);

				if (payload.eventType === 'INSERT') {
					if (member && payload.new.party_member_id !== member.id) return;
					photos = [...photos, payload.new];
				} else if (payload.eventType === 'DELETE') {
					if (!photos.some((photo) => photo.id === payload.old.id)) return;
					const index = photos.findIndex((photo) => photo.id === payload.old.id);
					photos.splice(index, 1);
				}
			}
		)
		.subscribe();
	});
</script>

<Drawer.Root bind:open>
	<Drawer.Portal>
		<div in:fly={{ y: 600, duration: 500 }}>
			<Drawer.Content
				class="fixed bottom-0 left-0 right-0 top-8 rounded-t-2xl bg-zinc-900/90 px-3 backdrop-blur"
			>
				<div class="flex h-14 items-center text-white">
					<div class="flex-grow p-1 text-xl font-semibold">My Photos</div>
					<button onclick={() => (open = false)}><X /></button>
				</div>
				{#if photos.length > 0}
					<div class="h-full w-full overflow-y-scroll" in:fade={{duration:300}}>
						<GalleryGrid {photos} members={[member]} userApp={true} />
					</div>
				{/if}
			</Drawer.Content>
		</div>
	</Drawer.Portal>
</Drawer.Root>
