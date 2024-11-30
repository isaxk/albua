<script lang="ts">
	import { user } from '$lib/supabase/auth.svelte';
	import { getPhotos } from '$lib/supabase/database.svelte';
	import { supabase } from '$lib/supabase/init';
	import type { Tables } from '$lib/types/supabase';
	import { dataURLtoFile, sleep } from '$lib/utils';
	import {
		GalleryVerticalEnd,
		RefreshCcw,
		Upload,
		X
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Drawer } from 'vaul-svelte';
	import GalleryGrid from '../gallery/gallery-grid.svelte';
	import Spinner from '../ui/spinner.svelte';
	import IconButton from './icon-button.svelte';
	import Shutter from './shutter.svelte';

	let {
		party,
		member,
		onupload
	}: {
		party: Tables<'parties'>;
		member: Tables<'party_members'>;
		onupload: (file: File) => Promise<{}>;
	} = $props();

	let videoElm: HTMLVideoElement;
	let canvasElm: HTMLCanvasElement;

	let track: MediaStreamTrack | null = $state(null);

	let photoViewMode: boolean = $state(false);
	let uploading: boolean = $state(false);
	let uploadComplete: boolean = $state(false);
	let imageDataUrl: string = $state('');
	let front: boolean = $state(false);

	let photos: Tables<'photos'>[] | { [key: string]: any; }[] = $state([]);

	function createTrack() {
		return new Promise(async (resolve) => {
			await navigator.mediaDevices
				.getUserMedia({
					video: { facingMode: front ? 'user' : 'environment', width: 720, height: 720 },
					audio: false
				})
				.then((stream) => {
					if (track) track.stop();
					track = stream.getVideoTracks()[0];
					videoElm.srcObject = stream;
					videoElm.play();
					resolve('');
				})
				.catch((err) => {
					console.log(`An error occurred: ${err}`);
				});
		});
	}

	onMount(async () => {
		createTrack();

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


	async function capture() {
		uploadComplete = false;
		const context = canvasElm.getContext('2d');
		canvasElm.width = 1080;
		canvasElm.height = 1080;
		if (context) {
			context.drawImage(videoElm, 0, 0, 1080, 1080);
			imageDataUrl = canvasElm.toDataURL();
			await sleep(150);
			photoViewMode = true;
			track?.stop();
		}
	}

	async function upload() {
		uploading = true;
		uploadComplete = false;
		const file = dataURLtoFile(imageDataUrl, 'capture.png');
		await onupload(file);
		await createTrack();
		await sleep(50);
		uploadComplete = true;
		await sleep(400);
		photoViewMode = false;
		imageDataUrl = '';
		uploading = false;
	}

	async function closeImageView() {
		await createTrack();
		await sleep(50);
		photoViewMode = false;
		imageDataUrl = '';
	}
</script>

<canvas class="hidden" bind:this={canvasElm}></canvas>

<div class="fixed inset-0 flex w-full flex-col bg-black text-white">
	<div class="flex h-32 items-center justify-center text-3xl font-semibold">{party.name}</div>

	<div class="relative flex-grow">
		<div
			class="absolute inset-0 flex items-center transition-all duration-0 {photoViewMode
				? 'opacity-0'
				: 'opacity-100 transition-all duration-200'} {front
				? '-scale-x-100 delay-300'
				: 'scale-x-100 delay-300'}"
		>
			<video bind:this={videoElm} autoplay muted playsinline class="aspect-square w-full"></video>
		</div>
		<div
			class="absolute inset-0 flex items-center {!photoViewMode
				? 'opacity-0'
				: 'opacity-100'} {uploadComplete
				? '-translate-y-[80vh] opacity-35 transition-all duration-300 ease-in'
				: 'translate-y-0'}"
		>
			<img src={imageDataUrl} alt="Still" class="aspect-square w-full" />
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/60 {uploading
					? 'opacity-100'
					: 'opacity-0'}"
			>
				<Spinner />
			</div>
		</div>
	</div>
	{#if photoViewMode}
		<div class="flex h-32 items-center justify-around px-4" in:fade={{ duration: 200 }}>
			<IconButton onclick={closeImageView}><X /></IconButton>
			<div class="w-16"></div>
			<IconButton onclick={upload}><Upload /></IconButton>
		</div>
	{:else}
		<div class="flex h-32 items-center justify-around px-4" in:fade={{ duration: 200 }}>
			<Drawer.Root>
				<Drawer.Trigger>
					<IconButton onclick={() => {}}><GalleryVerticalEnd /></IconButton>
				</Drawer.Trigger>
				<Drawer.Portal>
					<Drawer.Content
						class="fixed bottom-0 left-0 right-0 top-8 rounded-t-2xl bg-zinc-900/95 px-3 backdrop-blur"
					>
						<div class="flex h-14 items-center text-white">
							<div class="flex-grow p-1 text-xl font-semibold">My Photos</div>
							<Drawer.Close><X /></Drawer.Close>
						</div>
						{#if photos.length > 0}
							<div class="h-full w-full overflow-y-scroll" in:fade={{ duration: 300 }}>
								<GalleryGrid {photos} members={[member]} userApp={true} />
							</div>
						{/if}
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>
			<Shutter onclick={capture} />
			<IconButton
				onclick={() => {
					front = !front;
					createTrack();
				}}><RefreshCcw /></IconButton
			>
		</div>
	{/if}
</div>

<style lang="postcss">
	:global(body) {
		@apply overflow-hidden;
	}
</style>
