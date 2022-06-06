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
		<div
			on:click={() => {
				editing = true;
			}}
			class={className}
		>
			<span> {value}</span>
		</div>
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
		height: fit-content;
	}

	input,
	textarea {
		width: 100%;

		font-size: 16px;
	}
</style>
