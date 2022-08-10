# flipList
一个小型的可以通过拖拽来更换位置的vue3组件/util，并且利用flip技术让动画效果更加丝滑。分为横向拖动和竖向拖动更换位置。

# 使用

## 方式一：直接导出内置的组件使用
```vue
<template>
    <FlipList v-model="list">
        <div class="test-container">
            <div class="children" v-for="item in list" :key="item.id">{{ item.value }}</div>
        </div>
    </FlipList>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, reactive, ref } from 'vue'
// 暂时未发布，所以使用相对链接
import FlipList from '../src/main'


const list = reactive([{ id: 0, value: 0 }])
for (let i = 1; i < 20; ++i) {
    list.push({
        id: i, value: i
    })
}
</script>
```
## 方式2：直接使用对应的类自己构建
```vue
<template>
    <div class="test-container">
        <div class="children" v-for="item in list" :key="item.id">{{ item.value }}</div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, reactive, ref } from 'vue'
// 暂时未发布，所以使用相对链接
import { DropFlip } from '../src/main'


const list = reactive([{ id: 0, value: 0 }])
for (let i = 1; i < 20; ++i) {
    list.push({
        id: i, value: i
    })
}

onMounted(() => {
    new DropFlip(document.querySelector('.test-container'), list)
})
</script>
```
# config
```ts
declare type DragEventConfig = {
    dragClass?: string // 拖动的元素的className
}

// 排列方式。默认为横向
declare type DirectionType = 'level' | 'vertical'

declare type PositionType = 'top' | 'right' | 'bottom' | 'left'

declare type TipsLineClass = {
    [key in PositionType]: string
}

declare type FlipConfig = {
    transitionTimer?: string // 动画执行的时长 默认为 0.6s
    direction?: DirectionType // 排列方式
    tipsLineClass?: Partial<TipsLineClass> // 提示的线的 className
} & DragEventConfig


/**
 * 默认值
 * transitionTimer: '0.6s',
   direction: 'vertical',
   dragClass: 'flip_list_drag_class',
   tipsLineClass: {
       top: 'top_tips_line',
       right: 'right_tips_line',
       bottom: 'bottom_tips_line',
       left: 'left_tips_line'
    }
 */

```

# build
```shell
pnpm i
# build之后即可以发布，目前未更改发布配置，有需要的话得手动配置
pnpm build
```

# test
```shell
pnpm i
# 可以跑起测试项目 (test/test.vue)
pnpm test
```
