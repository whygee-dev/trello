<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	export const load: Load = async ({ session, params, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		const res = await fetch(`${params.id}/verify`);

		const data = await res.json();

		console.log(res);

		if (res.status !== 200) {
			return {
				status: 302,
				redirect: '/'
			};
		}

		return {
			status: 200,
			props: {
				id: data.workSpaceId ?? []
			}
		};
	};
</script>

<script lang="ts">
	import axios from 'axios';
	import { handleError } from '../../utils/errorHandler';
	export let id: string;
	const accept = async () => {
		try {
			let res = await axios.patch(`${id}/accept`);
			if (res.status === 200) {
				goto('/');
			}
			handleError(res);
		} catch (error) {
			console.log(error);
		}
	};
</script>

<button on:click={accept}>accept</button>
