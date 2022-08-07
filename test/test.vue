<template>
    <FlipList v-model="list">
        <div class="test-container">
            <div class="children" v-for="item in list" :key="item.id">{{ item.value }}</div>
        </div>
    </FlipList>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import FlipList from '../src/flip-list.vue'

const a = ref(1)

const list = reactive([{ id: 0, value: 0 }])
for (let i = 1; i < 20; ++i) {
    list.push({
        id: i, value: i
    })
}

</script>

<style lang="scss">
.test-container {
    display: flex;
    flex-direction: column;
    margin-left: calc(50% - 100px);

    .children {
        width: 100px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: aquamarine;
        margin-bottom: 20px;
    }
}
</style>