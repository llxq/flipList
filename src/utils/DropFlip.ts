import { DragEvent, dragEventFlag } from './DragEvent'

enum TRANSFORM {
    translateX = 'translateX',
    translateY = 'translateY'
}

export class DropFlip<T = any> {
    private readonly _styleId = Symbol('drop_flip_id').toString()

    private readonly _positionLineClassNames = ['bottom_tips_line', 'top_tips_line']

    private _firstRectMps: FlipMapType = new Map()

    private _lastRectMps: FlipMapType = new Map()

    private _events: Array<DragEvent> = []

    private _config: Required<FlipConfig> = {
        transitionTimer: '0.6s',
        direction: 'vertical',
        dragClass: 'flip_list_drag_class',
        tipsLineClass: {
            top: 'top_tips_line',
            right: '',
            bottom: 'bottom_tips_line',
            left: ''
        }
    }

    constructor (
        private readonly _container: HTMLElement,
        public list: T[],
        config?: FlipConfig
    ) {
        this._initConfig(config)
        this._first()
    }

    private _initConfig (config?: Partial<FlipConfig>): void {
        config && Object.assign(this._config, config)
    }

    private _first (): void {
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
                const { top } = diff
                if (top) {
                    item.value.setAttribute(`data-${ TRANSFORM.translateY }`, `${ top }`)
                    item.value.style.transform = `${ TRANSFORM.translateY }(${ top }px)`
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

    private _getPosition (someDom: HTMLElement, dom: HTMLElement): UndefinedAble<{ positionType: UndefinedAble<PositionType>, isTop: boolean }> {
        // some
        const { left: Cleft, top: Ctop, right: Cright, bottom: Cbottom, height: Cheight } = someDom.getBoundingClientRect()
        // target
        const { left: Pleft, top: Ptop, right: Pright, bottom: Pbottom } = dom.getBoundingClientRect()
        let positionType: UndefinedAble<PositionType> = void 0, isTop = false, diff: UndefinedAble<number> = undefined
        if (Ptop < Cbottom && Ptop > Ctop) {
            diff = Math.abs(Pbottom - Cbottom)
        }
        if (diff && typeof diff === 'number') {
            // 是否为一半
            if (diff > 0 && diff < Cheight) {
                positionType = diff < (Cheight / 2) ? 'top' : 'bottom'
            }
            isTop = !(Pbottom > Ctop && Pbottom < Cbottom)
        }

        return {
            positionType,
            isTop
        }

    }

    private _someMovingId (dom: HTMLElement, dom2: HTMLElement): boolean {
        return dom.getAttribute(dragEventFlag.key) === dom2.getAttribute(dragEventFlag.key)
    }

    private _updateClassName (diff: UndefinedAble<PositionType>, dom: HTMLElement): void {
        const { tipsLineClass } = this._config
        Object.keys(tipsLineClass ?? {}).forEach(key => {
            const className = Reflect.get(tipsLineClass, key)
            className && dom.classList.remove(className)
        })
        if (diff) {
            dom.classList.add(tipsLineClass[diff] ?? '')
        }
    }

    private _exchangeArray (beforeIdx: number, newIdx: number) {
        this.list.splice(newIdx, 0, this.list.splice(beforeIdx, 1).pop()!)
    }

    private _initDragEvent (dom: HTMLElement): DragEvent {
        const dragEvent = new DragEvent(dom, this._config)
        let keys: Array<HTMLElement> = Array.from(this._firstRectMps.keys())
        let beforeIdx: number, newIdx: number, positionType: UndefinedAble<PositionType>, isTop = false
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
                const { positionType: _positionType, isTop: _isTop } = this._getPosition(currentDom, movingTarget!)!
                this._updateClassName(_positionType!, currentDom)
                if (_positionType) {
                    newIdx = i
                    positionType = _positionType
                    isTop = _isTop
                    break movingFor
                }
            }
        }).watch('end', () => {
            for (let i = 0, lenght = keys.length; i < lenght; ++i) {
                const currentDom = keys[i]
                this._updateClassName(void 0, currentDom)
            }
            // 修改list
            this._exchangeArray(beforeIdx, (positionType === 'top' && !isTop) ? newIdx - 1 : newIdx)
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