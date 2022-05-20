<script>
	import { navigating } from '$app/stores';
	import Nav from '../components/Nav.svelte';
	import PreloadingIndicator from '../components/LoadingIndicator.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../style/global.scss';

	const options = {
		pausable: true,
		duration: 10000
	};
</script>

{#if $navigating}
	<PreloadingIndicator />
{/if}

<Nav />

<SvelteToast {options} />

<main class="app-main">
	<slot />
</main>
