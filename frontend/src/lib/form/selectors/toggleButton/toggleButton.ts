import "./toggleButton.scss"
import { SelectionBase, SelectorBase, SelectorOption } from "../selectorBase";
import { defineElement } from "@chocolatelibui/core";

interface Selection<T> extends SelectionBase<T> {
    top: HTMLDivElement,
    bot: HTMLDivElement
}

/**Toggle buttons, displays all options in a multi toggler*/
export class ToggleButton<T> extends SelectorBase<T, Selection<T>> {

    /**Returns the name used to define the element*/
    static elementName() { return 'togglebutton' }

    protected _addSelection(selection: SelectorOption<T>, index: number) {
        let top = this._body.appendChild(document.createElement('div'));
        top.tabIndex = 0;
        let bot = this._body.appendChild(document.createElement('div'));
        if (selection.icon) {
            top.appendChild(selection.icon);
            bot.textContent = selection.text;
        } else {
            top.textContent = selection.text;
        }
        let click = () => { this._valueSet(selection.value); }
        top.onclick = click;
        bot.onclick = click;
        top.onkeydown = (e) => {
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    e.stopPropagation();
                    this._valueSet(selection.value);
                    break;
                case 'ArrowRight':
                    e.stopPropagation();
                    this._selectAdjacent(true);
                    break;
                case 'ArrowLeft':
                    e.stopPropagation();
                    this._selectAdjacent(false);
                    break;
            }
        };
        return { top, bot, index, selection };
    }

    protected _clearSelections() {
        this._body.replaceChildren();
    }

    protected _setSelection(selection: Selection<T>) {
        selection.top.classList.add('selected');
        selection.bot.classList.add('selected');
    }

    protected _clearSelection(selection: Selection<T>) {
        selection.top.classList.remove('selected');
        selection.bot.classList.remove('selected');
    }

    protected _focusSelection(selection: Selection<T>) {
        selection.top.focus();
    }

}
defineElement(ToggleButton);