<script>
	import { navigating } from '$app/stores';
	import Nav from '../components/Nav.svelte';
	import PreloadingIndicator from '../components/LoadingIndicator.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	const options = {
		pausable: true,
		duration: 10000
	};
</script>

<svelte:head>
	<link rel="icon" type="image/svg" href={'logo-sm.svg'} />
	<link rel="stylesheet" href="/fonts.css" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}

<Nav />

<SvelteToast {options} />

<main class="app-main">
	<slot />
</main>
