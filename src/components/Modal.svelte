<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { clickOutside } from '../utils/clickOutside';
	export let open: boolean;
	export let header: string;
	export let footerButton: string;
	export let backdropClose = false;

	const dispatch = createEventDispatcher();

	const handleClose = () => {
		dispatch('close');
	};

	const handleCreate = () => {
		dispatch('create');
	};

	const handleClickOutisde = () => {
		if (backdropClose) {
			handleClose();
		}
	};
</script>

<div class="backdrop" class:open />
<section class="modal" use:clickOutside on:click_outside={handleClickOutisde} class:open>
	<div class="modal-header">
		<h3>{header}</h3>
		<button class="close blue-btn" on:click={handleClose}>
			<span>&times;</span>
		</button>
	</div>
	<div class="modal-body">
		<slot />
	</div>

	<div class="modal-footer">
		{#if footerButton}
			<button class="blue-btn" on:click={handleCreate}>{footerButton}</button>
		{/if}
	</div>
</section>

<style lang="scss">
	.backdrop {
		display: none;

		&.open {
			display: block;
		}

		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: black;
		opacity: 0.5;
	}

	.modal {
		position: fixed;
		z-index: 1;
		left: 50%;
		top: 50%;
		width: clamp(500px, 30vw, 700px);
		transform: translate(-50%, -50%);
		background-color: white;
		display: none;
		border-radius: 12px;
		padding: 20px;
		max-height: 90vh;
		overflow: auto;

		@media (max-width: 600px) {
			width: 90vw;
		}

		&.open {
			display: flex;
			flex-direction: column;
		}

		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;

			h3 {
				margin: 0;
			}

			button {
				padding: 0 10px;

				font-size: 30px;
				font-weight: 700;
			}
		}

		.modal-footer {
			button {
				margin-left: auto;
				display: block;
			}
		}
	}
</style>
