<script>
	import { navigating, page } from '$app/stores';
	import Nav from '../components/Nav.svelte';
	import PreloadingIndicator from '../components/LoadingIndicator.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { afterNavigate } from '$app/navigation';
	import layout from '../stores/layout';

	const options = {
		pausable: true,
		duration: 10000
	};

	$: pathname = $page.url.pathname;
	$: withNav = !['/', '/login', '/register'].includes(pathname);

	afterNavigate(({ to }) => {
		pathname = to.pathname;
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg" href={'/logo-sm.svg'} />
	<link rel="stylesheet" href="/fonts.css" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}

{#if withNav}
	<Nav />
{/if}

<SvelteToast {options} />

<main class="app-main" class:with-nav={withNav}>
	{#if !$navigating}
		<slot />
	{/if}
</main>

<style lang="scss">
	.app-main {
		background-color: #f9fafc;
		min-height: 100vh;

		&.with-nav {
			padding-top: 72px;
		}
	}
</style>
