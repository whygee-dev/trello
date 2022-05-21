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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}

<Nav />

<SvelteToast {options} />

<main class="app-main">
	<slot />
</main>
