<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '../utils/clickOutside';

	export let value = '';
	export let placeholder = '';
	export let className = '';
	export let textarea = false;

	let editing = false;

	const dispatch = createEventDispatcher();

	const handleSave = () => {
		dispatch('save');
	};
</script>

<div>
	{#if !editing}
		<p
			on:click={() => {
				editing = true;
			}}
			class={className}
		>
			{value}
		</p>
	{:else if textarea}
		<textarea
			on:blur={() => {
				handleSave();
				editing = false;
			}}
			use:clickOutside
			on:click_outside={() => {
				if (value) {
					handleSave();
				}

				editing = false;
			}}
			bind:value
			{placeholder}
		/>
	{:else}
		<input
			on:blur={() => {
				handleSave();
				editing = false;
			}}
			use:clickOutside
			on:click_outside={() => {
				if (value) {
					handleSave();
				}

				editing = false;
			}}
			type="text"
			bind:value
			{placeholder}
		/>{/if}
</div>

<style lang="scss">
	div {
		p {
			margin: 0;
			width: 100%;
			word-break: break-all;
			white-space: normal;
		}
	}

	input,
	textarea {
		width: 100%;

		font-size: 16px;
	}

	textarea {
		height: 200px;
		max-height: 200px;
	}
</style>
