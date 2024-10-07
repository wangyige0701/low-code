<script lang="ts" setup>
import AsideMenu from '@/components/AsideMenu/index.vue';
import AsideMenuConfig from './asideMenu';
import IForm from '@/components/Form/Index.vue';
import FormRender from './form'

const renderData = FormRender();
</script>

<template>
    <el-container class="w-full h-full bg-white">
        <el-aside class="flex flex-col z-20">
            <el-scrollbar>
                <AsideMenu :menu-list="AsideMenuConfig()"></AsideMenu>
            </el-scrollbar>
        </el-aside>
        <el-container>
            <IForm :render="renderData" />
        </el-container>
    </el-container>
</template>

<style scoped></style>
