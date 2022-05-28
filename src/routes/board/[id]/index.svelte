<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ session, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		return {};
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';

	let id = $page.params.id;
</script>

<svelte:head>
	<title>Tableaux | Trullo</title>
</svelte:head>
<section>
	Board {id}
</section>
