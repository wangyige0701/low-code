<script setup lang="ts">
onMounted(() => {
	$global.$router.replace({ name: 'Home' });
})
</script>

<template>
	<div class="root full-screen">
		<div class="mask w-1/2 h-3/5 transform-center user-select-none">
			<div>登录中...</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.root {
	background: linear-gradient(135deg, #5192f3, #d8e2f2);
}

.mask {
	background-color: rgba($color: #fff, $alpha: 0.3);
	backdrop-filter: blur(2px);
	border-radius: calculateRem(14);
	z-index: 100;
}
</style>
