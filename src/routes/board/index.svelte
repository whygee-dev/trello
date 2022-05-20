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
							<a href="#" class="nav-header nav-header-color">
								<div>
									<img class="icon-nav-left" src="/icon-board.svg" alt="Tableaux" />
								</div>
								Tableaux
							</a>
						</li>
						<li class="nav-board-item">
							<a href="#" class="nav-header-content">
								<div>
									<img class="icon-nav-left" src="/icon-modele.svg" alt="Modèles" />
								</div>
								Modèles
							</a>
						</li>
						<li class="nav-board-item">
							<a href="#" class="nav-header-content">
								<div>
									<img class="icon-nav-left" src="/icon-activity.svg" alt="Acceuil" />
								</div>
								Accueil
							</a>
						</li>
					</ul>
				</div>
			</nav>
			<div class="nav-container">
				<ul class="nav-work">
					<div class="nav-work-content">
						<div class="nav-work-header">
							Espace de travail <img class="icon-nav-right" src="/icon-plus.svg" alt="Plus" />
						</div>
						<!-- <li class="nav-board-item">Modèles</li>
						<li class="nav-board-item">Accueil</li>-->
					</div>
				</ul>
			</div>
		</div>
		<div class="all-boards">
			<div style="font-weight:bold;">
				<img src="/icon-clock.svg" class="icon-clock" alt="Horloge" />
				Récemment consultés
			</div>
		</div>
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
	.icon-clock {
		margin-left: 2px;
		float: bottom;
		margin-top: 4px;
		width: 25px;
		height: 25px;
	}
	.icon-nav-left {
		float: left;
		width: 25px;
	}
	.icon-nav-right {
		float: right;
		width: 25px;
	}
	.icon-nav-right:hover {
		background-color: #e7e9ed;
		border-radius: 4px;
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
		border-radius: 4px;
		font-weight: bold;
		color: #172b4d;
		margin: 0;
		min-height: 20px;
		padding: 6px 8px 6px 0;
		text-decoration: none;
		width: 207px;
	}
	.nav-header-content {
		border-radius: 4px;
		font-weight: bold;
		color: #172b4d;
		margin: 0;
		min-height: 20px;
		padding: 0px 8px 6px 0;
		text-decoration: none;
		width: 207px;
		height: 20px;
	}
	.nav-header-color {
		background-color: #e4f0f6;
		color: #0079bf;
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
