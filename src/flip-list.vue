<template>
    <div ref="flipListRef" class="flip-list">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue'
import { DropFlip } from './main'

interface PropsType {
    modelValue: Array<any>
    container?: HTMLElement
}

const props = withDefaults(defineProps<PropsType>(), {
    modelValue: () => []
})

const flipListRef: Ref<UndefinedAble<HTMLElement>> = ref(void 0)

const observers: Map<HTMLElement, DropFlip> = new Map()

const init = (dom: HTMLElement): void => {
    if (!observers.has(dom)) {
        observers.set(dom, new DropFlip(dom, props.modelValue))
    }
}

onMounted(() => {
    // 初始化列表的拖动，如果没有设置 container 则自动初始化插槽内部的所有元素
    if (!props.container) {
        const children = flipListRef.value?.children
        if (children?.length) {
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children.item(i) as NullAble<HTMLElement>
                item && init(item)
            }
        }
    } else {
        init(props.container)
    }
})

</script>

<style lang="scss" scoped>
$deep: '::v-deep()';

@mixin box () {
    position: relative;
}

@mixin setContent () {
    content: " ";
    width: 100%;
    height: 2px;
    background-color: #409eff;
    position: absolute;
    left: 0;
}

.flip-list {
    display: contents;

    #{$deep} .bottom_tips_line {
        @include box();
        
        &::after {
            @include setContent();
            bottom: -4px;
        }
    }

    #{$deep} .top_tips_line {
        @include box();
        
        &::before {
            @include setContent();
            top: -4px;
        }
    }

    #{$deep} .flip_list_drag_class {
        opacity: .8;
    }

}
</style>
