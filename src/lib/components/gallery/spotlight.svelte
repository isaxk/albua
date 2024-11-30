<script lang="ts">
	import { EllipsisVertical } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { DateTime } from 'luxon';

	let { photoId, date } = $props();
	let height = $state(0);
	let loaded = $state(false);

	const colors = [
		'bg-red-300/60',
		'bg-orange-300/60',
		'bg-amber-300/60',
		'bg-yellow-300/60',
		'bg-lime-300/60',
		'bg-green-300/60',
		'bg-emerald-300/60',
		'bg-teal-300/60',
		'bg-cyan-300/60',
		'bg-sky-300/60',
		'bg-blue-300/60',
		'bg-indigo-300/60',
		'bg-violet-300/60',
		'bg-purple-300/60',
		'bg-fuchsia-300/60',
		'bg-pink-300/60',
		'bg-rose-300/60'
	];

	let div: HTMLDivElement;

	const dateTime = DateTime.fromISO(date).toRelative({style:"short"});
</script>

<div
	in:fly={{ x: -100, duration: 400 }}
	class="relative aspect-square h-full overflow-hidden rounded-2xl {colors[
		Math.floor(Math.random() * colors.length)
	]}"
	style:min-width="{height}px"
	bind:clientHeight={height}
>
	<img
		onload={()=>loaded=true}
		src="https://cexwrecqxupsbtcxapip.supabase.co/storage/v1/object/public/photos/{photoId}.png"
		class="transition-all h-full w-full object-cover {loaded ? 'opacity-100' : 'opacity-0'}"
		alt="SPotlight"
	/>
	<div
		class="absolute bottom-0 left-0 flex h-14 w-96 items-center gap-0 rounded-tr-xl bg-black/70 text-white/80 drop-shadow-2xl"
	>
		<div class="flex-grow pl-4 text-lg font-medium">Isaac B</div>
		<div class="text-md text-white/50">{dateTime}</div>
		<button class="flex h-full w-14 items-center justify-center"
			><EllipsisVertical size={15} /></button
		>
	</div>
</div>
