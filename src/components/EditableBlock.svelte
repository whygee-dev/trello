<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '../utils/clickOutside';
	import edit from 'svelte-awesome/icons/edit';
	import Icon from 'svelte-awesome';

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

		<span on:click={() => (editing = true)}>
			<Icon data={edit} />
		</span>
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
		display: flex;
		align-items: center;
		p {
			margin: 0;
			width: 100%;
			word-break: break-all;
			white-space: normal;
			min-height: 30px;
		}

		:global(svg) {
			cursor: pointer;
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
