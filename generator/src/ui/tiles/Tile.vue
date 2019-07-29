<template>
	<div class="tile" :style="orientationStyle">
		<slot />
	</div>
</template>

<style scoped>
.tile {
	position: relative;
}
</style>

<script>
export default {
	props: {
		orientation: {
			type: Number, // [0-7]
			default: 0
		}
	},
	computed: {
		orientationStyle() {
			return {
				transform: `scaleX(${Math.floor(this.orientation / 4) * -2 +
					1}) rotate(${(this.orientation % 4) * 90}deg)`
			};
		}
	}
};
</script>
