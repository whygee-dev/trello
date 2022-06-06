<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { User } from '@prisma/client';
	import { Validators } from '../../utils/validators';
	import { createFieldValidator } from '../../utils/fieldValidator';
	import axios from 'axios';
	import { handleError } from '../../utils/errorHandler';
	import { toast } from '@zerodevx/svelte-toast';

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

	let fullname = user?.fullname ?? '';
	let username = user?.username ?? '';
	let email = user?.email ?? '';
	let password = '';

	const [passwordValidity, passwordValidate] = createFieldValidator(Validators.passwordValidator());
	const [fullnameValidity, fullnameValidate] = createFieldValidator(Validators.fullnameValidator());
	const [usernameValidity, usernameValidate] = createFieldValidator(Validators.usernameValidator());

	let imageInput: HTMLInputElement | null = null;
	let files: FileList;
	let image: string | ArrayBuffer | null = null || user?.image;

	function getBase64(_image: Blob) {
		const reader = new FileReader();
		reader.readAsDataURL(_image);
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target) {
				image = e.target.result;
			}
		};
	}

	const submit: svelte.JSX.EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
		try {
			const res = await axios.patch(`/profile/api/update`, {
				fullname,
				username,
				password,
				image
			});

			const data = await res.data;

			if (data) {
				toast.push('Profile updated successfully');
			}
		} catch (error) {
			handleError(error);
		}
	};
</script>

<svelte:head>
	<title>Thullo | profile</title>
</svelte:head>

<section class="container">
	<div class="logo">
		<img src="/logo.svg" alt="Thullo logo" />
	</div>

	<div class="profile-box">
		<h2>Modify your Thullo profile</h2>

		<form on:submit|preventDefault={submit}>
			<div>
				<input
					class="Fullname"
					type="text"
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
				<input class="email" type="email" disabled placeholder="Email" bind:value={email} />
			</div>

			<div>
				<input
					class="password"
					type="password"
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

			<div>
				<label for="file-upload" class="custom-file-upload"> Upload a profile image </label>
				<input
					class="hidden"
					id="file-upload"
					type="file"
					accept=".png,.jpg,.jpeg"
					bind:files
					bind:this={imageInput}
					on:change={() => getBase64(files[0])}
				/>

				<img
					class="uploaded-image"
					src={image
						? image.toString().startsWith('board')
							? image + '?' + Date.now()
							: image.toString()
						: '/default-profile.png'}
					alt="Uploaded"
				/>
			</div>

			<button class="btn" type="submit"> Modify</button>
		</form>
	</div>
</section>

<style lang="scss">
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100%;
		.uploaded-image {
			width: 250px;
			margin: auto;
			margin-top: 15px;
		}

		.custom-file-upload {
			border: 1px solid $blue;
			background-color: $light-blue;
			color: white;
			display: inline-block;
			padding: 6px 10px;
			cursor: pointer;
			border-radius: 4px;
			width: 75% !important;
			text-align: center;
			margin-left: 50px;
			margin-top: 10px;

			@media (max-width: 560px) {
				width: 75% !important;
				font-size: 14px;
			}
		}

		input[type='file'] {
			display: none;
		}

		.profile-box {
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

				input {
					&.field-danger {
						outline-color: red;
						border-color: red;
					}

					&.field-success {
						outline-color: #4c9aff;
						border-color: #4c9aff;
					}
				}

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
