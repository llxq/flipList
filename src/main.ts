import type { App, Component, Plugin } from 'vue'
import FlipListVue from './flip-list.vue'
import { DropFlip } from './utils/DropFlip'

type SFCWithInstall = InstanceType<typeof FlipListVue> & Plugin

const withInstall = (component: Component): SFCWithInstall => {
    (component as SFCWithInstall).install = function (app: App) {
        app.component((component as any).name, component)
    }

    return component as SFCWithInstall
}

const FlipList = withInstall(FlipListVue)

export {
    DropFlip,
    FlipList
}

export default FlipList

