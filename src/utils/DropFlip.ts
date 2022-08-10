import { DragEvent, dragEventFlag } from './DragEvent'

enum TRANSFORM {
    translateX = 'translateX',
    translateY = 'translateY'
}

const getDefaultConfig = (): Required<FlipConfig> => ({
    transitionTimer: '0.6s',
    direction: 'vertical',
    dragClass: 'flip_list_drag_class',
    tipsLineClass: {
        top: 'top_tips_line',
        right: 'right_tips_line',
        bottom: 'bottom_tips_line',
        left: 'left_tips_line'
    }
})

export class DropFlip<T = any> {
    private _firstRectMps: FlipMapType = new Map()

    private _lastRectMps: FlipMapType = new Map()

    private _events: Array<DragEvent> = []

    private _config: Required<FlipConfig> = getDefaultConfig()

    constructor (
        private readonly _container: HTMLElement,
        public list: T[],
        config?: FlipConfig
    ) {
        this.initConfig(config)
        this._first()
    }

    public initConfig (config?: Partial<FlipConfig>): void {
        Object.assign(this._config, config ?? getDefaultConfig())
    }

    private _first (): void {
        if (!this._container) {
            throw new Error(`${ this._container } is not defined`)
        }
        this._firstRectMps = this._getRectMap()
        this._initEvent()
    }

    private _last (): void {
        this._lastRectMps = this._getRectMap()
    }

    private _invert (): void {
        // 计算差异
        const keys: IterableIterator<HTMLElement> = this._lastRectMps.keys()
        let item: IteratorResult<HTMLElement, HTMLElement>
        while ((item = keys.next()) && !item.done) {
            const diff = this._calc(this._firstRectMps.get(item.value)!, this._lastRectMps.get(item.value)!)
            if (diff) {
                const { transition } = item.value.style
                if (transition) {
                    item.value.style.transition = ''
                }
                const { top, left } = diff
                if (top) {
                    item.value.setAttribute(`data-${ TRANSFORM.translateY }`, `${ top }`)
                    item.value.style.transform = `${ TRANSFORM.translateY }(${ top }px)`
                }
                if (left) {
                    item.value.setAttribute(`data-${ TRANSFORM.translateX }`, `${ left }`)
                    item.value.style.transform = `${ TRANSFORM.translateX }(${ left }px)`
                }
            }
        }
    }

    private _reset (): void {
        this._lastRectMps.forEach((_value: DOMRect, dom: HTMLElement) => {
            const { transform, transition } = dom.style
            if (!transition) {
                dom.style.transition = `all ${ this._config.transitionTimer }`
            }
            if (transform) {
                dom.style.transform = ''
            }
        })
    }

    private _calc (firstRect: DOMRect, lastRect: DOMRect): UndefinedAble<Partial<DOMRect>> {
        if (!firstRect || !lastRect) return
        const result: Partial<DOMRect> = {
            width: 0,
            height: 0,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
        Object.keys(result).forEach(key => {
            if (Reflect.has(firstRect, key) && Reflect.has(lastRect, key)) {
                const firstValue = Reflect.get(firstRect, key)
                const lastValue = Reflect.get(lastRect, key)
                Reflect.set(result, key, firstValue - lastValue)
            }
        })

        return result
    }

    private _getRectMap (): FlipMapType {
        const result: FlipMapType = new Map()
        if (!this._container || !this._container.children.length) return result
        const nodeList = this._container.children
        for (let i = 0, lenght = nodeList.length; i < lenght; ++i) {
            const dom = nodeList.item(i) as HTMLElement
            result.set(dom, dom.getBoundingClientRect())
        }
        return result
    }

    private _initEvent (): void {
        if (this._firstRectMps.size) {
            this._firstRectMps.forEach((_value: DOMRect, key: HTMLElement) => {
                key && this._events.push(this._initDragEvent(key))
            })
        }
    }

    private _getPositionType (someDom: HTMLElement, dom: HTMLElement): UndefinedAble<PositionType> {
        // some
        const { left: Cleft, top: Ctop, right: Cright, bottom: Cbottom, height: Cheight, width: Cwidth } = someDom.getBoundingClientRect()
        // isCloneNode
        const { left: Pleft, top: Ptop, right: Pright, bottom: Pbottom } = dom.getBoundingClientRect()
        let positionType: UndefinedAble<PositionType> = void 0, diff: UndefinedAble<number> = undefined

        if (this._config.direction === 'vertical') {
            if (Ptop < Cbottom && Ptop > Ctop) {
                diff = Math.abs(Pbottom - Cbottom)
            }
            if (diff && typeof diff === 'number' && Pleft > Cleft && Pleft < Cright) {
                // 是否为一半
                if (diff > 0 && diff < Cheight) {
                    positionType = diff < (Cheight / 2) ? 'top' : 'bottom'
                }
            }
        } else {
            if (Pleft > Cleft && Pleft < Cright) {
                diff = Math.abs(Pright - Cright)
            }
            if (diff && typeof diff === 'number' && Ptop < Cbottom && Ptop > Ctop) {
                if (diff > 0 && diff < Cwidth) {
                    positionType = diff < (Cwidth / 2) ? 'left' : 'right'
                }
            }
        }

        return positionType

    }

    private _someMovingId (dom: HTMLElement, dom2: HTMLElement): boolean {
        return dom.getAttribute(dragEventFlag.key) === dom2.getAttribute(dragEventFlag.key)
    }

    private _updateClassName (diff: UndefinedAble<PositionType>, dom: HTMLElement): void {
        const { tipsLineClass } = this._config
        Object.keys(tipsLineClass ?? {}).forEach(key => {
            const className = Reflect.get(tipsLineClass, key)
            const classList = dom.classList
            if (diff && diff === key) {
                const currentClassName = tipsLineClass[diff] ?? ''
                currentClassName && !classList.contains(currentClassName) && classList.add(currentClassName)
            } else {
                className && classList.remove(className)
            }
        })
    }

    private _exchangeArray (beforeIdx: number, newIdx: number): void {
        const pre = this.list.splice(beforeIdx, 1).pop()
        if (pre) {
            this.list.splice(newIdx > beforeIdx ? newIdx - 1 : newIdx, 0, pre)
        } else {
            throw new Error('The index of crossing the line')
        }
    }

    private _getNewIndex (positionType: PositionType, originNewIndex: number, beforeIdx: number): number {
        let condition = positionType === 'top'
        if (this._config.direction === 'level') {
            condition = positionType === 'left'
        }
        return condition ? originNewIndex : originNewIndex + 1
    }

    private _initDragEvent (dom: HTMLElement): DragEvent {
        const dragEvent = new DragEvent(dom, this._config)
        let keys: Array<HTMLElement> = Array.from(this._firstRectMps.keys())
        let beforeIdx: number, newIdx: number, positionType: UndefinedAble<PositionType>
        dragEvent.watch('start', () => {
            this._firstRectMps = this._getRectMap()
            keys = Array.from(this._firstRectMps.keys())
        }).watch('moving', ({ movingTarget }) => {
            // 判断上下相交
            movingFor: for (let i = 0, lenght = keys.length; i < lenght; ++i) {
                const currentDom = keys[i]
                if (movingTarget && this._someMovingId(currentDom, movingTarget)) {
                    beforeIdx = i
                    continue movingFor
                }
                const _positionType = this._getPositionType(currentDom, movingTarget!)!
                this._updateClassName(_positionType!, currentDom)
                if (_positionType) {
                    newIdx = i
                    positionType = _positionType
                    break movingFor
                }
            }
        }).watch('end', () => {
            for (let i = 0, lenght = keys.length; i < lenght; ++i) {
                const currentDom = keys[i]
                this._updateClassName(void 0, currentDom)
            }
            // 修改list
            positionType && console.log(beforeIdx, this._getNewIndex(positionType, newIdx, beforeIdx))
            positionType && this._exchangeArray(beforeIdx, this._getNewIndex(positionType, newIdx, beforeIdx))
            queueMicrotask(() => {
                this._last()
                this._invert()
                requestAnimationFrame(() => {
                    this._reset()
                })
            })
        })
        return dragEvent
    }

    public get container (): HTMLElement {
        return this._container
    }
}