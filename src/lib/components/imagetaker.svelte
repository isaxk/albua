<script lang="ts">
	import { signOut } from '$lib/supabase/auth.svelte';
	import { createPhotosStore, getPhotos, uploadPhoto } from '$lib/supabase/database.svelte';
	import { permission } from '@sveu/browser';
	import { GalleryVerticalEnd, RefreshCcw, Table, Upload, X, Zap } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Spinner from './spinner.svelte';
	import type { Tables } from '$lib/types/supabase';
	import GalleryGrid from './gallery/gallery-grid.svelte';
	import { quartIn, quartOut } from 'svelte/easing';
	import { Drawer } from 'vaul-svelte';

	import { spring } from 'svelte/motion';
	import { drag } from 'svelte-gesture';
	import MemberClientGallery from './gallery/member-client-gallery.svelte';

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	let canvas: HTMLCanvasElement;
	let video: HTMLVideoElement;

	let { party, member }: { party: Tables<'parties'>; member: Tables<'party_members'> } = $props();

	let photoViewMode = $state(false);
	let galleryView = $state(false);
	let torch = $state(false);
	let front = $state(false);
	let frontDone = $state(false);
	let frontWhiteFlash = $state(false);
	let photoData = $state('');
	let track: MediaStreamTrack | null = $state(null);
	let uploaded = $state(false);
	let loading = $state(false);

	const camera = permission('camera');


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
					video.srcObject = stream;
					video.play();
					resolve('');
				})
				.catch((err) => {
					console.log(`An error occurred: ${err}`);
				});
		});
	}

	onMount(async () => {
		video.setAttribute('autoplay', '');
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		createTrack();
	});

	function applyConstraints() {
		front = !front;
		createTrack().then(async () => {
			frontDone = front;
		});
	}

	async function takeStill() {
		const context = canvas.getContext('2d');
		canvas.width = 1080;
		canvas.height = 1080;
		if (context) {
			if (torch) {
				if (front) {
					frontWhiteFlash = true;
					await sleep(500);
					frontWhiteFlash = false;
					await sleep(200);
					frontWhiteFlash = true;
					await sleep(200);
				} else {
					track?.applyConstraints({
						// @ts-ignore
						advanced: [{ torch: true }]
					});
					await sleep(500);
					track?.applyConstraints({
						// @ts-ignore
						advanced: [{ torch: false }]
					});
					await sleep(200);
					track?.applyConstraints({
						// @ts-ignore
						advanced: [{ torch: true }]
					});
					await sleep(100);
				}
			}

			context.drawImage(video, 0, 0, 1080, 1080);
			const data = canvas.toDataURL('image/png');
			photoData = data;
			photoViewMode = true;
			track?.stop();

			await sleep(200);
			if (torch) {
				if (front) {
					await sleep(200);
					frontWhiteFlash = false;
				}
			}
			track?.applyConstraints({
				// @ts-ignore
				advanced: [{ torch: false }]
			});
		}
	}

	function clearPhoto() {
		const context = canvas.getContext('2d');
		if (context) {
			context.fillStyle = '#AAA';
			context.fillRect(0, 0, canvas.width, canvas.height);

			const data = canvas.toDataURL('image/png');
			photoData = data;
			createTrack();
		}
		photoViewMode = false;
	}

	function dataURLtoFile(dataurl: string, filename: string) {
		var arr = dataurl.split(','),
			// @ts-ignore
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	async function upload() {
		loading = true;
		await uploadPhoto(dataURLtoFile(photoData, ''), party.id);
		loading = false;
		uploaded = true;
		await sleep(200);
		photoViewMode = false;
		uploaded = false;
		createTrack();
	}

	let coords = spring({ x: 0, y: 0 });

	function handler({ detail }) {
		e.preventDefault();
		const {
			active,
			movement: [mx, my]
		} = detail;

		coords.set({
			x: active ? mx : 0,
			y: active ? my : 0
		});
	}
</script>

<div
	class="z-0 text-white {frontWhiteFlash ? 'bg-white' : 'bg-black'} fixed inset-0 flex items-center"
>
	<!-- svelte-ignore a11y_media_has_caption -->
	<div class="fixed left-0 right-0 top-0 z-0 flex h-32 items-center justify-center px-6">
		<div class="text-3xl font-semibold">
			<!-- <button onclick={signOut}>Sign Out</button> -->
			{party.name}
		</div>
	</div>
	{#if photoViewMode}
		{#if !uploaded}
			<img
				class="z-40 aspect-square w-full"
				src={photoData}
				alt="My one"
				out:fly={{ y: -400, duration: 400 }}
			/>
			<div
				out:fly={{ y: -400, duration: 400 }}
				class="absolute bottom-32 left-0 right-0 top-32 z-50 flex items-center justify-center bg-black/40 text-white transition-all {loading
					? 'opacity-100'
					: 'opacity-0'}"
			>
				<Spinner />
			</div>

			<div
				class="fixed bottom-0 left-0 right-0 flex h-32 items-center justify-between px-6"
				out:fade={{ duration: 200 }}
			>
				<button
					class="z-40 flex h-16 w-16 items-center justify-center rounded-full bg-transparent text-white"
					onclick={clearPhoto}
				>
					<X />
				</button>
				<button
					onclick={upload}
					class="justify-centerÌ z-40 flex h-16 w-16 items-center rounded-full bg-transparent text-white"
				>
					<Upload />
				</button>
			</div>
		{/if}
	{:else}
		<button
			class="fixed right-[5px] top-[140px] z-[100000] flex h-9 w-9 items-center justify-center rounded-full transition-all {!torch
				? 'bg-transparent text-white'
				: 'bg-zinc-50/80 text-black'}"
			onclick={() => (torch = !torch)}><Zap class="drop-shadow-md" size={16} /></button
		>
		<div
			in:fade={{ duration: 400, delay: 0 }}
			class="fixed bottom-0 left-0 right-0 flex h-32 items-center justify-around"
		>
			<button
				class="z-40 flex h-16 w-16 items-center justify-center rounded-full transition-all {!torch
					? 'bg-transparent text-white'
					: 'bg-zinc-50/80 text-black'}"
				onclick={() => (galleryView = true)}><GalleryVerticalEnd /></button
			>
			<button
				class="z-40 h-16 w-16 rounded-full border-4 border-white bg-transparent text-[0px]"
				onclick={takeStill}>Capture</button
			>

			<button
				class="z-40 flex h-16 w-16 items-center justify-center rounded-full bg-transparent text-white"
				onclick={() => {
					applyConstraints();
				}}
			>
				<RefreshCcw />
			</button>
		</div>
	{/if}
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video}
		autoplay
		muted
		playsinline
		class="duration-400 aspect-square w-full transition-all {photoViewMode || !track
			? 'opacity-0'
			: 'opacity-100'} {frontDone ? '-scale-x-100' : 'scale-x-100'}"
		>Video stream not available.</video
	>
	{#if $camera === 'prompt' && !track}
		<button onclick={createTrack}>Enable camera</button>
	{/if}
</div>

<MemberClientGallery member={member} party={party} bind:open={galleryView} />
<canvas bind:this={canvas} class="hidden"></canvas>
