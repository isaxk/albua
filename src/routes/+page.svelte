<script>
	import Imagetaker from '$lib/components/imagetaker.svelte';
	import { signInWithGoogle, user } from '$lib/supabase/auth.svelte';
</script>

{#if user.user && !user.user.is_anonymous}
	<div class="text-black">{user.user.email}</div>
    <a href="/new">Create Party</a>
{:else}
	<button onclick={signInWithGoogle}>Sign In With Google</button>
{/if}
