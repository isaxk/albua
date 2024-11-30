<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Delete, EllipsisVertical, Gavel, Trash } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

    let { onKick, onDelete } = $props();
	let open = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="w-8 h-full flex items-center justify-center">
		<EllipsisVertical size="15"/>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		transition={fly}
		transitionConfig={{ y: 10, duration: 200 }}
		class="rounded bg-black/90 z-50 text-white py-1 drop-shadow-xl border border-zinc-700/50"
	>
		<DropdownMenu.Item class="text-white flex cursor-pointer transition-all hover:bg-zinc-300/20 items-center py-1 pr-4" onclick={onDelete}>
            <div class="w-8 flex justify-center">
                <Trash size={15}/>
            </div>
            Delete photo
        </DropdownMenu.Item>
		<DropdownMenu.Item class="text-red-400 flex cursor-pointer transition-all hover:bg-zinc-300/20 items-center py-1 pr-4" onclick={onKick}>
            <div class="w-8 flex justify-center">
                <Gavel size={15}/>
            </div>
            Kick Member
        </DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
