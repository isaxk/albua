<script lang="ts">
	import Camera from '$lib/components/camera/camera.svelte';
	import Imagetaker from '$lib/components/imagetaker.svelte';
	import { signInAnonomously, user } from '$lib/supabase/auth.svelte';
	import { isUserInParty, joinMember, uploadPhoto } from '$lib/supabase/database.svelte.js';
	import { supabase } from '$lib/supabase/init.js';
	import type { Tables } from '$lib/types/supabase.js';
	import { onMount } from 'svelte';

	let { data } = $props();
	console.log(data);

	let name = $state('');
	let userInParty = $state(false);
	let member: Tables<'party_members'> | null = $state(null);

	supabase.auth.onAuthStateChange(async (_, session) => {
		if (session?.user) {
			setTimeout(async () => {
				member = await isUserInParty(data.party.id);
				supabase.channel('is-user-in-party').on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'party_members',
						filter: `user_id=eq.${session.user.id}`
					},
					(payload) => {
						member = payload.new[0];
					}
				);
			});
		}
	});

	async function joinGame() {
		if (!user.user) await signInAnonomously();
		console.log(await joinMember(name, data.party.id));
		member = await isUserInParty(data.party.id);
		const channel = supabase.channel('is-user-in-party').on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
				table: 'party_members',
				filter: `user_id=eq.${user.user?.id}`
			},
			(payload) => {
				member = payload.new[0];
			}
		);
	}

	function handleUpload(file: File) {
		return new Promise<{ error: string | null }>(async (resolve) => {
			uploadPhoto(file, data.party).then((res) => {
				console.log(res);
				resolve(res);
			});
		});
	}
</script>

<svelte:document
	onvisibilitychange={() => {
		if (!document.hidden) {
			supabase.channel('is-user-in-party').on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'party_members',
					filter: `user_id=eq.${user.user?.id}`
				},
				(payload) => {
					member = payload.new[0];
				}
			);
			console.log(supabase.getChannels());
		}
	}}
/>

{#if user.user && member && !member.kicked}
	<!-- <Imagetaker party={data.party} {member} /> -->
	<Camera party={data.party} {member} onupload={handleUpload} />
{:else if member && member.kicked}
	<p class="p-4 text-3xl font-medium">You were kicked</p>
{:else}
	<div class="flex h-[100vh] w-full flex-col bg-black text-white">
		<div class="flex h-32 items-center justify-center text-3xl font-semibold">
			{data.party.name}
		</div>
		<div class="px-4 text-left">
			<div class="flex w-full flex-col gap-2 rounded bg-zinc-100/10 px-5 py-5 text-left">
				<div class="flex w-full flex-grow flex-col gap-2">
					<div class="w-full font-medium">Enter a name to attatch to your photos:</div>
					<input
						bind:value={name}
						type="text"
						class="max-w-md border border-zinc-400 bg-transparent bg-zinc-900 p-2"
					/>
				</div>
				<button class="mx-auto w-full rounded bg-white px-6 py-2 text-black" onclick={joinGame}
					>Join</button
				>
			</div>
		</div>
	</div>
{/if}
