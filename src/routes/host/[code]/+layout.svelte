<script lang="ts">
	import GalleryItem from '$lib/components/gallery/gallery-item.svelte';
	import { activePhoto } from '$lib/stores/index.svelte';
	import { user } from '$lib/supabase/auth.svelte';
	import { qr } from '@svelte-put/qr/svg';
	import { quartOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	let { data, children } = $props();
</script>

{#if data.party.host_user_id === user.user?.id}
	<div class="flex h-screen w-full">
		<div class="flex min-w-[400px] max-w-[400px] flex-col bg-zinc-100 text-center drop-shadow-2xl">
			<h1
				class="flex h-20 items-center justify-center border-b bg-zinc-100 text-center text-4xl font-semibold drop-shadow"
			>
				{data.party.name}
			</h1>
			<div class="flex flex-grow flex-col justify-between px-10 pb-10 pt-5">
				<div class="w-full">Take photos of the event and have them shown on this screen!</div>
				<div class="flex flex-col gap-2">
					<div class="text-center text-xl font-bold">Scan the qr code to join</div>
					<div class="flex items-center justify-center border bg-zinc-100 drop-shadow-lg">
						<svg
							class="w-full"
							use:qr={{
								data: 'https://albua.isaxk.com/party/{code}',
								logo: '',
								shape: 'circle'
							}}
						/>
					</div>
				</div>

				<div class="flex w-full flex-col justify-center gap-0 text-center text-lg font-normal">
					or go to: <span class="font-medium">albua.isaxk.com/party/{data.code}</span>
				</div>
			</div>
		</div>
		<div class="relative min-w-0 flex-grow bg-black">
			{@render children()}
			{#if activePhoto.value !== null}
				<div in:fade={{duration:150}} out:fade={{duration:150}} class="absolute inset-0 z-40 flex h-full w-full items-center p-10 justify-center bg-black/80 backdrop-blur">
					<button class="absolute inset-0 z-0" onclick={() => (activePhoto.value = null)}>
						close
					</button>
					<div class="absolute z-20 top-3 bottom-3 xl:top-4 xl:bottom-4" in:scale={{start: 0.9, easing: quartOut}} out:scale={{start: 0.95, easing: quartOut}}>
						<GalleryItem
							spotlight
							onclick={() => (activePhoto.value = null)}
							dbId={activePhoto.value.id}
							photoId={activePhoto.value.bucket_file_id}
							date={activePhoto.value.created_at}
							memberPage={activePhoto.memberPage}
							member={data.members.filter((member) => member.id == activePhoto.value.party_member_id)[0]}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}{/if}
