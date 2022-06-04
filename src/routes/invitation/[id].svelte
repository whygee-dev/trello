<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import axios from 'axios';

	export const load: Load = async ({ session, params, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		const  data  = await fetch(`invitation/${params.id}`);

		return {
			status: 200,
			props: {
				id: params.id ?? []
			}
		};
	};
</script>

<script lang="ts">
	export let id: string;
</script>

{id}
