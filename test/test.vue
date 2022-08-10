<template>
    <FlipList v-model="list" :config="config">
        <div class="test-container" :class="isVertical ? 'test-container-vertical' : ''">
            <div class="children" v-for="item in list" :key="item.id">{{ item.value }}</div>
        </div>
    </FlipList>

    <button @click="updatePosition">切换位置</button>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, reactive, ref } from 'vue'
import FlipList from '../src/main'

const list = reactive([{ id: 0, value: 0 }])
for (let i = 1; i < 20; ++i) {
    list.push({
        id: i, value: i
    })
}

const config: ComputedRef<Partial<FlipConfig>> = computed(() => {
    return {
        direction: isVertical.value ? 'vertical' : 'level'
    }
})

const isVertical = ref(false)

const updatePosition = () => {
    isVertical.value = !isVertical.value
}

</script>

<style lang="scss">
.test-container {
    display: flex;
    margin-left: 50px;
    width: 500px;
    flex-wrap: wrap;

    .children {
        width: 100px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: aquamarine;
        margin-right: 20px;
        margin-bottom: 20px;
    }
}

.test-container-vertical {
    width: 100%;
    flex-direction: column;
    height: 500px;
    flex-wrap: wrap;
    align-items: flex-start;
}
</style>