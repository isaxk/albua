<script lang="ts">
	import { page } from '$app/stores';
	import { EllipsisVertical } from 'lucide-svelte';
	import { DateTime } from 'luxon';
	import { fly } from 'svelte/transition';
	import Menu from './menu.svelte';
	import { deletePhoto, kickMember } from '$lib/supabase/database.svelte';
	import { activePhoto } from '$lib/stores/index.svelte';

	let {
		dbId,
		photoId,
		date,
		spotlight = false,
		memberPage = false,
		member,
		onclick,
		userApp = false
	} = $props();

	let height = $state(0);
	let loaded = $state(false);

	const dateTime = DateTime.fromISO(date).toRelative({ style: 'short' });

	const colors = [
		'bg-red-400',
		'bg-orange-400',
		'bg-amber-400',
		'bg-yellow-400',
		'bg-lime-400',
		'bg-green-400',
		'bg-emerald-400',
		'bg-teal-400',
		'bg-cyan-400',
		'bg-sky-400',
		'bg-blue-400',
		'bg-indigo-400',
		'bg-violet-400',
		'bg-purple-400',
		'bg-fuchsia-400',
		'bg-pink-400',
		'bg-rose-400'
	];

	function handleDelete() {
		deletePhoto(dbId, photoId);
	}

	let moveX = 0;
	let mouseDown = false;

	function handleMouseDown() {
		mouseDown = true;
	}
	function handleMouseUp() {
		mouseDown = false;
		console.log(moveX);
		if (moveX > 20 || moveX < -20) {
			moveX = 0;
		} else {
			onclick();
		}
		moveX = 0;
	}
	function handleMouseMove(e: MouseEvent) {
		if (mouseDown) {
			moveX += e.movementX;
			console.log(moveX);
		}
	}
</script>

{#if spotlight}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		in:fly={{ x: -100, duration: 400 }}
		class="relative col-span-3 row-span-3 aspect-square h-full overflow-hidden rounded-2xl
		bg-zinc-200/5"
		style:min-width="{height}px"
		bind:clientHeight={height}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<img
			onmousedown={handleMouseDown}
			onmouseup={handleMouseUp}
			onmousemove={handleMouseMove}
			onload={() => (loaded = true)}
			draggable="false"
			src="https://cexwrecqxupsbtcxapip.supabase.co/storage/v1/object/public/photos/{photoId}.png"
			class="h-full w-full select-none object-cover transition-all duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			alt="SPotlight"
		/>
		<div
			class="absolute bottom-0 left-0 flex h-14 drop-shadow-xl {memberPage
				? 'w-max pl-6'
				: 'w-96'} items-center gap-0 rounded-tr-xl bg-black/70 text-white/80 drop-shadow-2xl"
		>
			{#if !memberPage && !userApp}
				<a
					class="text-md flex-grow pl-4 font-medium"
					onclick={() => (activePhoto.value = null)}
					href="{$page.url.pathname}/member/{member.id}">{member ? member.nickname : 'user'}</a
				>
			{/if}
			<div class="text-md text-white/50">{dateTime}</div>
			<div class="h-full px-2">
				<Menu
					onDelete={handleDelete}
					onKick={(deletePhotos: boolean) => kickMember(member.id, deletePhotos)}
				/>
			</div>
		</div>
	</div>
{:else}
	<div class="relative aspect-square overflow-hidden rounded-xl bg-zinc-200/5">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<img
			onmousedown={handleMouseDown}
			onmouseup={handleMouseUp}
			onmousemove={handleMouseMove}
			draggable="false"
			onload={() => (loaded = true)}
			src="https://cexwrecqxupsbtcxapip.supabase.co/storage/v1/object/public/photos/{photoId}.png"
			alt=""
			class="h-full w-full object-cover {loaded ? 'opacity-100' : 'opacity-0'} select-none"
		/>
		<div
			class="absolute bottom-0 left-0 right-0 flex h-8 items-center gap-2 bg-black/50 pl-2 text-white/70"
		>
			{#if memberPage || userApp}
				<div class="flex-grow"></div>
			{:else}
				<a
					onclick={async () => (activePhoto.value = null)}
					class="min-w-0 flex-grow overflow-x-hidden text-ellipsis text-nowrap pl-2 text-xs font-medium text-white/70"
					href="{$page.url.pathname}/member/{member.id}">{member ? member.nickname : 'user'}</a
				>
			{/if}
			<div class="text-nowrap text-[10px]">{dateTime}</div>
			<Menu onDelete={handleDelete} onKick={(deletePhotos: boolean) => kickMember(member.id, deletePhotos)} />
		</div>
	</div>
{/if}
