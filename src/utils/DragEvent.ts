export const dragEventFlag = {
    uuid: new Date().valueOf(),
    key: 'data-movingId',
    movingTarget: { 
        key: 'data-isCloneNode', 
        value: Symbol('data-isCloneNode').toString()
    }
}

export class DragEvent {
    private _cloneDom: UndefinedAble<HTMLElement>

    private _position: Position = { x: 0, y: 0 }

    private watchFncMpa: WatchFncMapType = new Map()

    constructor (private _dom: HTMLElement, private _config: DragEventConfig = {}) {
        this._init()
    }

    private _updateStyle (dom: HTMLElement, styles: Object) {
        Object.assign(dom.style, styles)
    }

    private _cloneDomFnc (brother: HTMLElement): HTMLElement {
        const { left, top, width, height } = brother.getBoundingClientRect()
        // clone一份元素
        const children: HTMLElement = <HTMLElement>brother.cloneNode(true)
        // 复制一份原来控件的类名
        const classList: string = brother.classList.toString()
        // 给clone的元素加上这个类名
        children.classList.add(classList)
        // 增加自定义类
        this._config.dragClass && children.classList.add(this._config.dragClass)
        // 阻止原生拖拽，否则会影响模拟拖拽
        children.ondragstart = () => false
        // 可以通过 dragClass 覆盖样式
        this._updateStyle(children, {
            position: 'fixed',
            left: left + 'px',
            top: top + 'px',
            width: width + 'px',
            height: height + 'px',
            cursor: 'all-scroll',
            zIndex: '2021',
            transition: ''
        })
        const { movingTarget: { key, value } } = dragEventFlag
        children.setAttribute(key, value)
        return children
    }

    private _dragMoving (ev: MouseEvent) {
        document.getSelection()?.empty()
        if (this._cloneDom) {
            const { clientX, clientY } = ev
            const { offsetLeft, offsetTop } = this._cloneDom
            const left = `${ offsetLeft + clientX - this._position.x }px`
            const top = `${ offsetTop + clientY - this._position.y }px`
            this._updateStyle(this._cloneDom, { left, top })
            this._runWatchFnc('moving')
            Object.assign(this._position, { x: clientX, y: clientY })
        }
    }

    private _init (): void {
        if (this._dom) {
            // 给 dom 打上标识
            this._dom.setAttribute(dragEventFlag.key, String(++dragEventFlag.uuid))
            this._dom.addEventListener('mousedown', this._dragEvent.bind(this))
        }
    }

    private _dragEvent (event: MouseEvent): void {
        const target = event.target as HTMLElement
        if (target) {
            this._runWatchFnc('start')
            this._cloneDom = this._cloneDomFnc(target)
            this._dom.parentElement?.appendChild(this._cloneDom)
            Object.assign(this._position, { x: event.clientX, y: event.clientY })
            const _dragMoving = this._dragMoving.bind(this)
            document.addEventListener('mousemove', _dragMoving)
            const mouseupFnc = () => {
                document.removeEventListener('mousemove', _dragMoving)
                document.removeEventListener('mouseup', mouseupFnc)
                this._cloneDom?.remove()
                this._cloneDom = void 0
                this._runWatchFnc('end')
            }
            document.addEventListener('mouseup', mouseupFnc)
        }
    }

    private _runWatchFnc (watchType: WatchType, args?: WatchFncArgs): void {
        if (this.watchFncMpa.has(watchType)) {
            this.watchFncMpa.get(watchType)!.forEach(fnc => fnc(
                args ?? { position: this._cloneDom?.getBoundingClientRect(), movingTarget: this._cloneDom }
            ))
        }
    }

    public watch (watchType: WatchType, fnc: WatchFncType): DragEvent {
        if (!this.watchFncMpa.has(watchType)) {
            this.watchFncMpa.set(watchType, [])
        }
        this.watchFncMpa.get(watchType)?.push(fnc)
        return this
    }
}