<script lang="ts">
	let { onclick, children } = $props();
</script>

<button {onclick} class="w-16 h-16 flex items-center justify-center">
    {@render children()}
</button>