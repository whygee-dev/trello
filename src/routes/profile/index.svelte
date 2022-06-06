<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { User } from '@prisma/client';

	export const load: Load = async ({ session, fetch, params }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		try {
			const userReq = await fetch(`/profile/api`);
			const user = await userReq.json();

			return {
				status: userReq.status,
				props: { user: user ?? null }
			};
		} catch (error) {
			console.log(error);
		}

		return {
			status: 401,
			props: { user: null }
		};
	};
</script>

<script lang="ts">
	export let user: User;
</script>

<div>Profil of user goes here: {user.email}</div>

<style lang="scss">
</style>
