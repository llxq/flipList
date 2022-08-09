declare type DragEventConfig = {
    dragClass?: string
}

declare type Position = {
    x: number
    y: number
}
declare type WatchType = 'start' | 'moving' | 'end'

declare type WatchFncArgs = {
    position: UndefinedAble<DOMRect>
    movingTarget: UndefinedAble<HTMLElement>
}

declare type WatchFncType = (params: WatchFncArgs) => void

declare type WatchFncMapType = Map<WatchType, Array<WatchFncType>>

declare type FlipMapType = Map<HTMLElement, DOMRect>

declare type PositionType = 'top' | 'right' | 'bottom' | 'left'

declare type TipsLineClass = {
    [key in PositionType]: string
}

declare type DirectionType = 'level' | 'vertical'

declare type FlipConfig = {
    transitionTimer?: string
    direction?: DirectionType
    tipsLineClass?: Partial<TipsLineClass>
} & DragEventConfig