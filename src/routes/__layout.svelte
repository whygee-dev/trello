<script>
	import { navigating } from '$app/stores';
	import Nav from '../components/Nav.svelte';
	import PreloadingIndicator from '../components/LoadingIndicator.svelte';
	import '../style/global.scss';
</script>

<svelte:head>
	<link rel="icon" type="image/svg" href={"logo-sm.svg"}>
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}

<Nav />

<main class="app-main">
	<slot />
</main>
