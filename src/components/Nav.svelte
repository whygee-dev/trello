<script>
	import { session } from '$app/stores';

	import { layout } from '../stores/layout';
	import Avatar from './Avatar.svelte';
	import { clickOutside } from '../utils/clickOutside';
	import axios from 'axios';

	$: innerWidth = 0;
	$: dropdownOpen = false;

	const handleClickOutsideDropdown = () => {
		dropdownOpen = false;
	};

	const handleChevronClick = () => {
		dropdownOpen = !dropdownOpen;
	};

	const onLogout = async () => {
		try {
			const res = await axios.post('/auth/logout');

			if (res.data.message === 'OK') {
				window.location.reload();
			}
		} catch (error) {
			console.log(error);
		}
	};
</script>

<svelte:window bind:innerWidth />

<nav>
	<a href="/boards">
		{#if innerWidth <= 568}
			<img src="/logo-sm.svg" alt="App logo" width="75" height="36" />
		{:else}
			<img src="/logo.svg" alt="App logo" width="136" height="36" />
		{/if}
	</a>

	{#if $layout?.boardName}
		<h3 class="board-name">
			{$layout.boardName}
		</h3>
	{/if}

	{#if $layout?.searchBarVisible}
		<div>
			<input type="text" />
		</div>
	{/if}

	<div class="dropdown-avatar">
		<div class="avatar-container" on:click={handleChevronClick}>
			<Avatar width={32} round={false} userFullName={$session.user?.fullname || ''} />

			<span> {$session.user?.fullname}</span>

			<span class="chevron-down" />
		</div>
		<div
			class="dropdown"
			use:clickOutside
			on:click_outside={handleClickOutsideDropdown}
			class:active={dropdownOpen}
		>
			<div on:click={async () => await onLogout()}>
				<span class="red">Logout</span>
			</div>
		</div>
	</div>
</nav>

<style lang="scss">
	a {
		margin: 0;
	}
	nav {
		box-shadow: 0px 2px 2px 0px #0000000d;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 15px 20px;
		position: fixed;
		top: 0;
		background-color: #fff;

		.board-name {
			margin: 0;
			font-size: clamp(0.5rem, 2vw, 1.5rem);
		}

		@media (max-width: 568px) {
			.board-name {
				display: none;
			}
		}

		.dropdown-avatar {
			position: relative;
		}
		.dropdown {
			display: none;

			&.active {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-content: center;
				width: 100%;
				padding: 10px;
				position: absolute;
				background-color: white;
				top: 50px;
				border-radius: 12px;
				box-shadow: 0px 4px 12px 0px #0000000d;

				> div {
					cursor: pointer;

					.red {
						color: red;
					}
				}
			}
		}

		.avatar-container {
			cursor: pointer;
			display: flex;
			align-items: center;

			span {
				margin-left: 15px;
			}
			:global(img) {
				border-radius: 4px;
			}

			.chevron-down {
				width: 0;
				height: 0;
				border-left: 5px solid transparent;
				border-right: 5px solid transparent;
				border-top: 5px solid black;
			}
		}
	}
</style>
