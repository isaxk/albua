<script lang="ts">
	import { signInWithGoogle, user } from '$lib/supabase/auth.svelte';
</script>

{#if user.user && !user.user.is_anonymous}
	<div class="text-black">test</div>
{:else}
	<button onclick={signInWithGoogle}>Sign In With Google</button>
{/if}
