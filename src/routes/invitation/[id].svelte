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

		if (res.status !== 200) {
			return {
				status: 302,
				redirect: '/boards?toast=Your invitation is no longer valid.'
			};
		}

		return {
			status: 302,
			props: {
				id: data.workSpaceId ?? [],
				name: data.workSpace.title ?? []
			}
		};
	};
</script>

<script lang="ts">
	import axios from 'axios';
	import Modal from '../../components/Modal.svelte';
	export let id: string;
	export let name: string;
	let confirmModal = true;

	const accept = async () => {
		try {
			await axios.patch(`${id}/accept`);
			goto('/');
		} catch (error) {
			console.log(error);
		}
	};
</script>

<Modal
	footerButton="+ Accept"
	header="Invitation to join"
	open={confirmModal}
	on:close={() => ((confirmModal = false), goto('/'))}
	on:create={accept}
>
	<div>
		<p>You have been invited to join the workSpace {name}</p>
	</div>
</Modal>
