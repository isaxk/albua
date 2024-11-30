<script lang="ts">
	import { user } from '$lib/supabase/auth.svelte';
	import { AlertDialog, DropdownMenu, Checkbox, Label } from 'bits-ui';
	import { Check, EllipsisVertical, Gavel, Trash } from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';

	let { onKick, onDelete, userApp=false } = $props();
	let dialogOpen = $state(false);
	let deletePhotos = $state(true);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="flex h-full w-8 items-center justify-center">
		<EllipsisVertical size="15" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		transition={fly}
		transitionConfig={{ y: 10, duration: 200 }}
		class="z-50 rounded border border-zinc-700/50 bg-black/90 py-1 text-white drop-shadow-xl"
	>
		<DropdownMenu.Item
			class="flex cursor-pointer items-center py-1 pr-4 text-white transition-all hover:bg-zinc-300/20"
			onclick={onDelete}
		>
			<div class="flex w-8 justify-center">
				<Trash size={15} />
			</div>
			Delete photo
		</DropdownMenu.Item>
		{#if !userApp}
			<DropdownMenu.Item
				onclick={() => (dialogOpen = true)}
				class="flex cursor-pointer items-center py-1 pr-4 text-red-400 transition-all hover:bg-zinc-300/20"
			>
				<div class="flex w-8 justify-center">
					<Gavel size={15} />
				</div>
				Kick Member
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={dialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			onclick={() => (dialogOpen = false)}
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed inset-0 z-50 bg-black/80"
		/>
		<AlertDialog.Content
			transition={scale}
			transitionConfig={{ start: 0.9, duration: 200 }}
			class="shadow-popover fixed left-[50%] top-[50%] z-50 grid w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-7 outline-none sm:max-w-lg md:w-full"
		>
			<div class="flex flex-col gap-4">
				<AlertDialog.Title class="text-lg font-semibold tracking-tight"
					>Are you sure you want to <span class="text-red-600">kick</span> this member?</AlertDialog.Title
				>
				<div class="flex items-center gap-1 space-x-3">
					This will also <span class="text-red-500">delete</span> any photos they have uploaded
				</div>

				<div class="flex w-full items-end justify-center gap-2">
					<AlertDialog.Cancel class="h-10 w-full rounded bg-zinc-200 drop-shadow-sm"
						>Cancel</AlertDialog.Cancel
					>
					<AlertDialog.Action
						onclick={() => onKick(deletePhotos)}
						class="h-10 w-full rounded bg-red-800 text-white drop-shadow-sm"
						>Kick</AlertDialog.Action
					>
				</div>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
