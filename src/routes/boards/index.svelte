<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ session, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		try {
			const response = await fetch('/workspace/findAllByUser');

			const json = await response.json();

			return {
				status: response.status,
				props: {
					workspaces: json ?? []
				}
			};
		} catch (error) {
			console.error('err', error);
		}

		return {};
	};
</script>

<script lang="ts">
	import type { Board, WorkSpace } from '@prisma/client';
	import Avatar from '../../components/Avatar.svelte';
	export let workspaces: (WorkSpace & {
		users: User[];
		boards: Board[];
	})[] = [];

	console.log(workspaces);
</script>

<svelte:head>
	<title>Boards | Trullo</title>
</svelte:head>
<section class="container container-blue">
	<section class="control">
		<h3>All boards</h3>
		<button>+ Add</button>
	</section>

	<section class="workspaces">
		{#each workspaces as workspace}
			<div class="workspace">
				<div class="header">
					<h4>
						{workspace.title}
					</h4>

					<div class="members">
						{#each workspace.users as user}
							<div class="member">
								<Avatar width={28} userFullName={user?.fullname ?? ''} />
							</div>
						{/each}
					</div>
				</div>

				<div class="boards">
					{#each workspace.boards as board}
						<a class="board" href={'/board/' + board.id}>
							<img src={board.image ?? '/default-board.jpg'} alt="Board" />
							<h5>{board.title}</h5>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</section>
</section>

<style lang="scss">
	.container {
		width: 100%;
		max-width: 950px;
		margin: auto;
		padding: 0 20px;

		.control {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 50px;

			h3 {
				margin: 0;
			}

			button {
				margin: 0;
				background-color: #2f80ed;
				color: white;
				border-radius: 8px;
				padding: 8px 15px;
				transition: all 0.3s;

				&:hover {
					background-color: darken(#2f80ed, 10%);
				}
			}
		}

		.workspaces {
			display: flex;
			flex-direction: column;

			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.members {
					display: flex;
					.member {
						margin-left: 5px;
					}
				}

				:global(img) {
					border-radius: 8px;
				}
			}
			h4 {
				margin: 50px 0;
			}

			.members {
				position: 'relative';
			}
			.boards {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;

				@media (max-width: 600px) {
					justify-content: space-around;
				}

				.board {
					text-decoration: none;
					color: black;
					background-color: white;
					border-radius: 12px;
					box-shadow: 0px 4px 12px 0px #0000000d;
					width: 250px;
					padding: 10px;
					margin: 10px;

					img {
						width: 100%;
						border-radius: 12px;
					}
				}
			}
		}
	}
</style>
