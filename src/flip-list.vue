<template>
    <div ref="flipListRef" class="flip-list">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watchEffect } from 'vue'
import { DropFlip } from './utils/DropFlip'

export default defineComponent({
    name: 'FlipList',
    props: {
        modelValue: {
            type: Object as PropType<Array<any>>,
            required: true
        },
        config: Object as PropType<FlipConfig>,
        container: Object as PropType<HTMLElement>
    },
    setup (props) {
        const flipListRef: Ref<UndefinedAble<HTMLElement>> = ref(void 0)

        const observers: Map<HTMLElement, DropFlip> = new Map()

        const init = (dom: HTMLElement): void => {
            if (!observers.has(dom)) {
                observers.set(dom, new DropFlip(dom, props.modelValue, props.config))
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

        watchEffect(() => {
            const config = props.config
            observers?.forEach(value => value.initConfig(config))
        }, { flush: 'post' })

        return { flipListRef }
    }
})

</script>

<style lang="scss">
@mixin box () {
    position: relative;
}

@mixin setContent () {
    content: " ";
    background-color: #409eff;
}

@mixin verticalTips () {
    @include setContent();
    width: 100%;
    height: 2px;
    position: absolute;
    left: 0;
}

@mixin levelTips () {
    @include setContent();
    width: 2px;
    height: 100%;
    position: absolute;
    top: 0;
}

.flip-list {
    display: contents;

    .bottom_tips_line {
        @include box();

        &::after {
            @include verticalTips();
            bottom: -4px;
        }
    }

    .top_tips_line {
        @include box();

        &::before {
            @include verticalTips();
            top: -4px;
        }
    }

    .left_tips_line {
        @include box();

        &::before {
            @include levelTips();
            left: -4px;
        }
    }

    .right_tips_line {
        @include box();

        &::before {
            @include levelTips();
            right: -4px;
        }
    }

    .flip_list_drag_class {
        opacity: .8;
    }

}
</style>
