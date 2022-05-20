<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ session, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}
		return {};
	};
</script>

<svelte:head>
	<title>Tableaux | Trullo</title>
</svelte:head>
<section>
	<div class="container">
		<div class="nav-container">
			<nav class="nav">
				<div class="nav-board-content">
					<ul class="nav-board">
						<li>
							<a href="#" class="nav-header">
								<img width="20px" height="20px" src="/logo-sm.svg" alt="ok" />Tableaux
							</a>
						</li>
						<li class="nav-board-item">Modèles</li>
						<li class="nav-board-item">Accueil</li>
					</ul>
				</div>
			</nav>
			<div class="nav-container">
				<ul class="nav-work">
					<div class="nav-work-content">
						<div class="nav-work-header">Espace de travail <span> + </span></div>
						<!-- <li class="nav-board-item">Modèles</li>
						<li class="nav-board-item">Accueil</li>-->
					</div>
				</ul>
			</div>
		</div>
		<div class="all-boards" />
	</div>
</section>

<style lang="scss">
	section {
		min-height: calc(100vh - 40px);
	}
	.container {
		align-items: flex-start;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-content: space-around;
	}
	.nav-container {
		position: sticky;
		top: 0;
		color: #172b4d;
		font-size: 14px;
		font-weight: 400;
		line-height: 20px;
	}
	.nav-work {
		display: flex;
		margin-left: 15px;
	}
	.nav {
		margin: 40px 0 0;
		padding: 0 16px;
		width: 240px;
	}
	.all-boards {
		margin: 40px 16px 0;
		max-width: 825px;
		min-width: 288px;
		width: 100%;
	}
	.nav-board-content {
		display: block;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: list-item;
		padding: 6px 8px 6px 0;
		font-weight: bold;
		background-color: #f9fafc;
	}
	li:last-child {
		margin-bottom: 12px;
	}

	.nav-header {
		background-color: #e4f0f6;
		color: #0079bf;
		border-radius: 4px;
		font-weight: bold;
		margin: 0;
		min-height: 20px;
		padding: 6px 8px 6px 0;
		text-decoration: none;
		width: 207px;
	}
	.nav-board-item:hover {
		background-color: #e7e9ed;
		min-height: 20px;
		padding: 6px 8px 6px 0;
		border-radius: 4px;
	}
	.nav-work-header {
		font-size: 12px;
		font-weight: bold;
		line-height: 20px;
		margin: 0;
		min-height: 20px;
		overflow: hidden;
		padding: 6px 8px 6px 0;
		text-decoration: none;
		color: #5e6c84;
		width: 207px;
	}
</style>
