<template>
	<Tile v-bind="tileProps(paletteMapping)">
		<div class="bgTopLeft"></div>
		<div class="bgTopRight"></div>
		<div class="bgBottomLeft"></div>
		<div class="bgBottomRight"></div>
		<div class="screen"></div>
	</Tile>
</template>

<style scoped>
.bgTopLeft {
	position: absolute;
	width: 50%;
	height: 50%;
	background: var(--bgTopLeftColor);
}
.bgTopRight {
	position: absolute;
	right: 0;
	width: 50%;
	height: 50%;
	background: var(--bgTopRightColor);
}
.bgBottomLeft {
	position: absolute;
	bottom: 0;
	width: 50%;
	height: 50%;
	background: var(--bgBottomLeftColor);
}
.bgBottomRight {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50%;
	height: 50%;
	background: var(--bgBottomRightColor);
}
.screen {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: var(--screenColor);
}
</style>

<script>
import tileMixin from "ui/mixins/tileMixin";

export default {
	constants: {
		paletteMapping: {
			bgTopLeftColor: true,
			bgTopRightColor: true,
			bgBottomLeftColor: true,
			bgBottomRightColor: true,
			screenColor: true
		}
	},
	mixins: [tileMixin]
};
</script>
