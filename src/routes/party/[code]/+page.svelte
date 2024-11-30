<script lang="ts">
	import Imagetaker from '$lib/components/imagetaker.svelte';
	import { signInAnonomously, user } from '$lib/supabase/auth.svelte';
	import { isUserInParty, joinMember } from '$lib/supabase/database.svelte.js';
	import { supabase } from '$lib/supabase/init.js';

	let { data } = $props();
	console.log(data);

	let name = $state("");
	let userInParty = $state(false);

	supabase.auth.onAuthStateChange(async (_, session)=>{
		if(session) {
			userInParty = await isUserInParty(data.party.id) ?? false;
		}
	})

	async function joinGame() {
		if (!user.user) await signInAnonomously();
		console.log(await joinMember(name, data.party.id));
		userInParty = await isUserInParty(data.party.id) ?? false;
	}


</script>


{#if user.user && userInParty}
	<Imagetaker party={data.party}/>
{:else}
	
	<div class="flex h-[100vh] w-full items-center bg-black text-white">
		<div class="flex flex-col gap-5 w-full px-4">
			{data.code}
			<h1 class="w-full text-center text-4xl font-bold border-zinc-800">{data.party.name}</h1>
			<div class="px-5 text-center w-full py-5 rounded bg-zinc-100/10 flex flex-col gap-2">
				<div class="w-full font-medium">Enter a name to attatch to your photos:</div>
				<input bind:value={name} type="text" class="border max-w-md border-zinc-400 bg-transparent bg-zinc-900 p-2" />
                <button class="bg-white mt-4 w-max mx-auto px-6 py-2 text-black rounded" onclick={joinGame}>Join</button>
			</div>
            
		</div>
	</div>
{/if}
