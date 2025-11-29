import "./dropDown.scss"
import { Base, defineElement } from "@chocolatelibui/core";
import { SelectionBase, SelectorBase, SelectorBaseOptions, SelectorOption } from "../selectorBase";
import { material_navigation_unfold_less_rounded, material_navigation_unfold_more_rounded } from "@chocolatelibui/icons";


interface Selection<T> extends SelectionBase<T> {
    line: HTMLDivElement
}

export interface DropDownOptions<T> extends SelectorBaseOptions<T> {
    /**Default text displayed*/
    default?: string,
}

class DropDownBox extends Base {
    private _container: HTMLDivElement = this.appendChild(document.createElement('div'));
    private _box: HTMLDivElement = this._container.appendChild(document.createElement('div'));
    private _dropdown: DropDown<any> | undefined;
    private _resizeListener = () => { this.closeMenu(); }
    constructor() {
        super();
        this._box.tabIndex = 0;
        this.onclick = () => {
            this.closeMenu();
        };
        this.ontouchend = (e) => {
            if (e.target === this) {
                if (e.cancelable) {
                    e.preventDefault();
                }
                e.stopPropagation();
                this.closeMenu();
            }
        }
        this.onpointerdown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.pointerType === 'touch' && (e.target === this || e.target === this._container)) {
                this.closeMenu();
            }
        };
        this.onpointerup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target !== this && e.pointerType !== 'touch') {
                this.closeMenu();
            }
        };
        this.addEventListener('focusout', (e) => {
            if (e.relatedTarget === null) {
                this.closeMenu();
            }
        });
        this.onwheel = (e) => {
            e.preventDefault();
        }
        this._box.onwheel = (e) => {
            if (this._box.scrollHeight !== this._box.clientHeight) {
                e.stopPropagation();
            }
        }
        this.onkeydown = (e) => {
            switch (e.key) {
                case 'Escape':
                    this.closeMenu();
                    e.stopPropagation();
                    break;
                case ' ':
                case 'Enter':
                    e.stopPropagation();
                    this.closeMenu();
                    break;
                case 'Tab':
                case 'ArrowUp':
                case 'ArrowDown':
                    if (this.ownerDocument.activeElement === this._box) {
                        if (e.shiftKey || e.code === 'ArrowUp') {
                            //@ts-expect-error
                            (<HTMLElement>this._dropdown._box.lastChild)?.focus()
                        } else {
                            //@ts-expect-error
                            (<HTMLElement>this._dropdown._box.firstChild)?.focus()
                        }
                    } else {
                        if (e.shiftKey || e.code === 'ArrowUp') {
                            (<HTMLElement>this.ownerDocument.activeElement?.previousElementSibling)?.focus();
                        } else {
                            (<HTMLElement>this.ownerDocument.activeElement?.nextElementSibling)?.focus();
                        }
                    }
                    e.preventDefault()
                    break;
            }
        };

    }
    /**Returns the name used to define the element*/
    static elementName() { return 'dropdownbox' }
    /**Returns the namespace override for the element*/
    static elementNameSpace() { return 'chocolatelibui-form'; }

    openMenu(box: HTMLDivElement, parent: DropDown<any>, ref: HTMLDivElement, selection?: Selection<any>) {
        let innerHeight = this.ownerDocument.defaultView?.innerHeight || 0;
        this.classList.add('open');
        this._box.replaceChildren(box);
        let bounds = ref.getBoundingClientRect();
        if (bounds.y + (bounds.height / 2) < innerHeight / 2) {
            let top = bounds.y + bounds.height;
            this._container.style.top = top + 'px';
            this._container.style.bottom = '';
            this._container.style.height = innerHeight - top - 20 + 'px';
            this._container.style.flexDirection = 'column';
        } else {
            let bottom = innerHeight - bounds.y;
            this._container.style.top = '';
            this._container.style.bottom = bottom + 'px';
            this._container.style.height = innerHeight - bottom - 20 + 'px';
            this._container.style.flexDirection = 'column-reverse';
        }
        this._container.style.left = bounds.x + 'px';
        this._container.style.width = bounds.width + 'px';
        this._dropdown = parent;

        if (this._box.scrollHeight > this._box.clientHeight) {
            this._box.classList.add('scroll');
        } else {
            this._box.classList.remove('scroll');
        }
        (selection ? selection.line : this._box).focus();
        //@ts-expect-error
        parent._doOpen = true;
        this.ownerDocument.defaultView?.addEventListener('resize', this._resizeListener);
    }

    closeMenu() {
        this.classList.remove('open');
        if (this._dropdown) {
            //@ts-expect-error
            this._dropdown._doOpen = false;
            this._dropdown.focus();
        }
        this.ownerDocument.defaultView?.removeEventListener('resize', this._resizeListener);
    }
}
defineElement(DropDownBox);
let box = document.documentElement.appendChild(new DropDownBox);

/**Dropdown box for selecting between multiple choices in a small space*/
export class DropDown<T> extends SelectorBase<T, Selection<T>> {
    private _box: HTMLDivElement = document.createElement('div');
    private _icon: HTMLDivElement = document.createElement('div');
    private _text: HTMLDivElement = document.createElement('div');
    private _default: Text = document.createTextNode('Select something');
    private _open: HTMLDivElement = document.createElement('div');
    private _keyCombo: string = '';
    private _keyIndex: number = 0;
    private _keyTimeout: number = 0;
    private _keyTimeoutIndex: number = 0;

    /**Returns the name used to define the element*/
    static elementName() { return 'dropdown' }

    constructor() {
        super();
        this._body.tabIndex = 0;
        this._body.onclick = () => {
            box.openMenu(this._box, this, this._body, this._selection);
        }
        this._body.onpointerdown = (e) => {
            if (e.pointerType === 'mouse') {
                box.openMenu(this._box, this, this._body, this._selection);
                e.preventDefault();
            }
        }
        this._body.onkeydown = (e) => {
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    box.openMenu(this._box, this, this._body, this._selection);
                    break;
                case 'ArrowDown':
                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    this._selectAdjacent(e.key === 'ArrowDown');
                    break;
            }
            if (e.key.length === 1) {
                const combo = (this._keyCombo += e.key).toLowerCase();
                clearTimeout(this._keyTimeout);
                clearTimeout(this._keyTimeoutIndex);
                this._keyTimeout = setTimeout(() => { this._keyCombo = ''; }, 200);
                this._keyTimeout = setTimeout(() => { this._keyIndex = 0; }, 2000);
                let keyIndex = this._keyIndex;
                for (let i = this._keyIndex; i < this._selections.length; i++) {
                    const selection = this._selections[i].selection;
                    if (selection.text.toLowerCase().startsWith(combo)) {
                        this._valueSet(selection.value);
                        this._keyIndex = i + 1;
                        return;
                    }
                }
                if (keyIndex) {
                    for (let i = 0; i < keyIndex; i++) {
                        const selection = this._selections[i].selection;
                        if (selection.text.toLowerCase().startsWith(combo)) {
                            this._valueSet(selection.value);
                            this._keyIndex = i + 1;
                            return;
                        }
                    }
                }
            }
        };
        let line = this._body.appendChild(document.createElement('div'));
        line.appendChild(this._icon);
        line.appendChild(this._text);
        this._text.appendChild(this._default);
        line.appendChild(this._open);
        this._open.appendChild(material_navigation_unfold_more_rounded());
    }

    /**Sets options for the element*/
    options(options: DropDownOptions<T>) {
        super.options(options);
        if (options.default) {
            this.default = options.default;
        }
        return this;
    }

    /**Gets the default text displayed when nothing has been selected yet */
    get default() {
        return this._default.nodeValue || '';
    }

    /**Sets the default text displayed when nothing has been selected yet */
    set default(def: string) {
        this._default.nodeValue = def;
    }

    protected _addSelection(selection: SelectorOption<T>, index: number) {
        let line = document.createElement('div');
        let icon = line.appendChild(document.createElement('div'));
        if (selection.icon) {
            icon.appendChild(selection.icon);
        }
        let text = line.appendChild(document.createElement('div'));
        text.textContent = selection.text;
        line.onpointerup = (e) => {
            if (e.pointerType !== 'touch') {
                this._valueSet(selection.value);
            }
        };
        line.onclick = () => {
            this._valueSet(selection.value);
        };
        line.tabIndex = 0;
        line.onkeydown = (e) => {
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this._valueSet(selection.value);
                    break;
            }
        };
        this._box.appendChild(line);
        return { line, index, selection };
    }

    protected _clearSelections() {
        this._box.replaceChildren();
    }

    protected _setSelection(selection: Selection<T>) {
        selection.line.classList.add('selected');
        if (selection.selection.icon) {
            this._icon.replaceChildren(selection.selection.icon?.cloneNode(true));
        } else {
            this._icon.replaceChildren();
        }
        this._text.textContent = selection.selection.text;
    }

    protected _clearSelection(selection: Selection<T>) {
        selection.line.classList.remove('selected');
        this._icon.replaceChildren();
        this._text.textContent = selection.selection.text;
    }

    protected _focusSelection(selection: Selection<T>) {
        selection
    }

    protected set _doOpen(open: boolean) {
        if (open) {
            this._open.replaceChildren(material_navigation_unfold_less_rounded());
        } else {
            this._open.replaceChildren(material_navigation_unfold_more_rounded());
        }
    }

    focus() {
        this._body.focus();
    }
}
defineElement(DropDown);
