<template>
	<div class="container">
    <img class="image" src="/static/qr.png" />
    <div class="overlay"></div>
	</div>
</template>

<style scoped>
.container {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 1.5in;
	height: 1.5in;
	transform: translate(-50%, -50%);
	mix-blend-mode: multiply;
}
.image {
	box-sizing: border-box;
	position: absolute;
	padding: 0.22in;
	width: 100%;
	height: 100%;
  background: white;
}
.overlay {
	position: absolute;
	margin: 0.22in;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background: var(--qrColor);
	mix-blend-mode: lighten;
}
</style>
