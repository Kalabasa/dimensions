<template>
<Tile>
    <div class="body"></div>
    <div class="screen"></div>
</Tile>
</template>

<style>
.body {
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--bodyColor);
}
.screen {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--screenColor);
}
</style>
