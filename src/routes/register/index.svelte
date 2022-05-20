<script context="module" lang="ts">
	export const load: Load = async ({ session }) => {
		if (session.user) {
			return {
				status: 302,
				redirect: '/board'
			};
		}
		return {};
	};
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { toast } from '@zerodevx/svelte-toast';
	import type { Load } from '@sveltejs/kit';
	import { createFieldValidator } from '../../utils/fieldValidator';
	import { Validators } from '../../utils/validators';

	let fullname = '';
	let username = '';
	let email = '';
	let password = '';

	const [emailValidity, emailValidate] = createFieldValidator(Validators.emailValidator());
	const [passwordValidity, passwordValidate] = createFieldValidator(Validators.passwordValidator());
	const [fullnameValidity, fullnameValidate] = createFieldValidator(Validators.fullnameValidator());
	const [usernameValidity, usernameValidate] = createFieldValidator(Validators.usernameValidator());

	const submit: svelte.JSX.EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
		try {
			const response = (await axios.post(`auth/register`, { email, password, fullname, username }))
				.data;

			if (response) {
				$session.user = response;

				toast.push('Account created successfully');

				goto('/board');
			}
		} catch (error: any) {
			toast.pop(0);

			if (Array.isArray(error.response.data.errors)) {
				error.response.data.errors.forEach((element: string) => {
					element && toast.push(element);
				});
			} else {
				toast.push(
					error.response.data.message || error.response.data.error || 'An unexpected error occured'
				);
			}
		}
	};
</script>

<svelte:head>
	<title>Create a Thullo Account</title>
</svelte:head>

<section class="container">
	<div class="logo">
		<img src="/logo.svg" alt="Thullo logo" />
	</div>

	<div class="register-box">
		<h2>Create a Thullo Account</h2>

		<form on:submit|preventDefault={submit}>
			<div>
				<input
					class="Fullname"
					type="text"
					required
					placeholder="Fullname"
					bind:value={fullname}
					class:field-danger={!$fullnameValidity.valid && $fullnameValidity.dirty}
					class:field-success={$fullnameValidity.valid}
					use:fullnameValidate={fullname}
				/>
				{#if $fullnameValidity.dirty && !$fullnameValidity.valid}
					<span class="validation-hint">
						{$fullnameValidity.message}
					</span>
				{/if}
			</div>

			<div>
				<input
					class="Username"
					type="text"
					required
					placeholder="Username"
					bind:value={username}
					class:field-danger={!$usernameValidity.valid && $usernameValidity.dirty}
					class:field-success={$usernameValidity.valid}
					use:usernameValidate={username}
				/>

				{#if $usernameValidity.dirty && !$usernameValidity.valid}
					<span class="validation-hint">
						{$usernameValidity.message}
					</span>
				{/if}
			</div>

			<div>
				<input
					class="email"
					type="email"
					required
					placeholder="Email"
					bind:value={email}
					class:field-danger={!$emailValidity.valid && $emailValidity.dirty}
					class:field-success={$emailValidity.valid}
					use:emailValidate={email}
				/>

				{#if $emailValidity.dirty && !$emailValidity.valid}
					<span class="validation-hint">
						{$emailValidity.message}
					</span>
				{/if}
			</div>

			<div>
				<input
					class="password"
					type="password"
					required
					placeholder="Password"
					bind:value={password}
					class:field-danger={!$passwordValidity.valid && $passwordValidity.dirty}
					class:field-success={$passwordValidity.valid}
					use:passwordValidate={password}
				/>

				{#if $passwordValidity.dirty && !$passwordValidity.valid}
					<span class="validation-hint">
						{$passwordValidity.message}
					</span>
				{/if}
			</div>

			<button class="btn" type="submit"> Sign up </button>
		</form>

		<div class="separator" />

		<a href="/login">Already have an account? Log In</a>
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

		.register-box {
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
				> div {
					display: flex;
					flex-direction: column;
					width: 100%;
					margin: auto;

					span {
						font-size: 12px;
						color: red;
						text-align: left;
						width: 80%;
						margin: auto;
					}
				}

				display: flex;
				flex-direction: column;
				input,
				button {
					width: 80%;
				}

				input {
					margin: 15px auto 5px;
				}

				button {
					color: white;
					background: #0079bf;
					transition: all 0.3s;
					&:hover {
						background-color: #0065ff;
					}

					font-weight: 600;
					font-size: 16px;
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

		@media (max-width: 500px) {
			.register-box {
				width: 300px;
			}
		}
	}
</style>
