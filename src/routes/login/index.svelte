<script context="module" lang="ts">
	export async function load({ session }: { session: App.Session }) {
		if (session.user) {
			return {
				status: 302,
				redirect: '/'
			};
		}
		return {};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	let email = '';
	let password = '';
	let errors = null;

	const submit: svelte.JSX.EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
		try {
			const response = (await axios.post(`auth/login`, { email, password })).data;

			if (response.user) {
				$session.user = response.user;
				goto('/');
			}
		} catch (error) {}
	};
</script>

<svelte:head>
	<title>Log in to Thullo</title>
</svelte:head>

<section class="container">
	<div class="logo">
		<img src="/logo.svg" alt="Thullo logo" />
	</div>

	<div class="login-box">
		<h2>Log in to Thullo</h2>

		<form on:submit|preventDefault={submit}>
			<input class="email" type="email" required placeholder="Email" bind:value={email} />
			<input
				class="password"
				type="password"
				required
				placeholder="Password"
				bind:value={password}
			/>

			<button class="btn" type="submit"> Log in </button>
		</form>

		<div class="separator" />

		<a href="/register" target="_blank">Sign up for an account</a>
	</div>
</section>

<style lang="scss">
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100%;
		img {
			height: 43px;
			width: 197px;
			margin: 50px auto;
		}

		.login-box {
			background-color: white;
			width: 50%;
			box-shadow: rgb(0 0 0 / 10%) 0 0 10px;
			border-radius: 4px;
			width: 400px;
			padding-bottom: 30px;
			h2 {
				font-size: 16px;
				text-align: center;
				color: #5e6c84;
				margin: 30px 0;
			}
			form {
				display: flex;
				flex-direction: column;

				input,
				button {
					width: 90%;
				}

				button {
					color: white;
					background: #5aac44;
					transition: all 0.3s;
					&:hover {
						background-color: #61bd4f;
					}

					font-weight: 700;
				}
			}

			.separator {
				width: 90%;
				height: 1px;
				background-color: hsl(0, 0%, 80%);
				margin: 20px auto 40px;
			}

			a {
				font-size: 14px;
			}
		}
	}
</style>
