<script>
	import { Loader } from '@svelteuidev/core';
</script>

<div>
	<Loader variant="bars" size={350} />
</div>

<style lang="scss">
	div {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
