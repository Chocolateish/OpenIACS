import "./group.scss"
import { Component, componentNameStart, ComponentBaseOptions, Way, ValueComponent } from "../common";
import { unfold_less, unfold_more } from "../icons/icons";
import { AccessTypes } from "../values/access";

/**Defines options for group component 
 * @typedef {Object} GroupComponentInternalOptions
 * @property {[Component]} components list of component to add to the group at creation
 * @property {Way} position positions the group absolutly in its container the group must still be at the correct position in the dom flow
 * @property {ComponentGroupBorderStyle} border the style of the border of the group
 * 
 * Defines options for group component 
 * @typedef {ComponentBaseOptions & GroupComponentInternalOptions} GroupComponentOptions*/

/**Different border styles for the component group
 * @enum {number}*/
export let ComponentGroupBorderStyle = { NONE: 0, OUTSET: 1, INSET: 2 }

/**Component group class which allows to add components and controls the flow of the components*/
export class Group extends Component {
    constructor() {
        super();
        /**List of all components with id
         * @type {{[s:string]:ValueComponent}}
         * @private */
        this.__valueComponents = {};
        this.__container = this;
    }
    /**Options toggeler
     * @param {GroupComponentOptions} options*/
    options(options) {
        super.options(options)
        if (options.components instanceof Array) {
            for (let i = 0, n = options.components.length; i < n; i++) {
                this.addComponent(options.components[i]);
            }
        }
        if (typeof options.position !== 'undefined') { this.position = options.position; }
        if (typeof options.border !== 'undefined') { this.border = options.border; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'group' };

    /**Creates an instance of the component group
     * @param {GroupComponentOptions} options
     * @returns {Group} */
    static create(options) {
        if (!options) { console.warn('Parameter must be passed'); return; }
        let elem = new Group(options);
        elem.options(options);
        return elem;
    }

    /**This adds the component to the group
     * @param {Component} comp
     * @returns {Component}*/
    addComponent(comp) {
        if (comp instanceof Component) {
            if (comp instanceof ValueComponent) {
                let id = comp.id;
                if (id) {
                    if (id in this.__valueComponents) {
                        console.warn('Component id already in group');
                    } else {
                        this.__valueComponents[id] = comp
                    }
                }
            }
            this.__container.appendChild(comp);
        } else {
            console.warn('None component added to group');
            return comp;
        }
    }

    /**This places the group at an absolute position in one of the corners of the container
     * @param {Way} pos */
    set position(pos) {
        this.classList.remove('drawTop', 'drawBottom', 'drawLeft', 'drawRight');
        if (typeof pos == 'number') { this.classList.add(['drawTop', 'drawBottom', 'drawLeft', 'drawRight'][pos]); }
    }

    /**This places the group at an absolute position in one of the corners of the container
     * @param {ComponentGroupBorderStyle} pos */
    set border(border) {
        if (typeof border == 'number') {
            this.classList.remove('bOut', 'bIn');
            this.classList.add(['', 'bOut', 'bIn'][border]);
        }
    }

    /**Internal access call 
     * @param {AccessTypes} a
     * @private*/
    __onAccess(a) {
        switch (a) {
            case AccessTypes.READ: {
                this.tabIndex = 0;
                this.onfocus = () => { document.body.focus(); };
                break;
            }
            case AccessTypes.WRITE: {
                this.removeAttribute('tabIndex');
                this.onfocus = null;
                break;
            }
        }
    }

    /**Returns an object with the values of all components with id
     * @returns {{[s:string]:ComponentInternalValue}} */
    get values() {
        let vals = {};
        for (const key in this.__valueComponents) {
            vals[key] = this.__valueComponents[key].value;
        }
        return vals;
    }

    /**Returns an object with the values of all components with id and which value has changed
     * @returns {{[s:string]:ComponentInternalValue}} */
    get changedValues() {
        let vals = {};
        for (const key in this.__valueComponents) {
            let val = this.__valueComponents[key].changed
            if (typeof val !== 'undefined') {
                vals[key] = val;
            }
        }
        return vals;
    }

    /**Returns true if any of the value components with id has a changed value
     * @returns {boolean} */
    get hasChangedValue() {
        for (const key in this.__valueComponents) {
            if (typeof this.__valueComponents[key].changed !== 'undefined') {
                return true;
            }
        }
        return false;
    }

    /**Updates the internal buffers off all  */
    updateValueBuffers() {
        for (const key in this.__valueComponents) {
            this.__valueComponents[key].updateValueBuffer();
        }
    }

    /**Changes the values of all value components with ids
     * @param {{[s:string]:ComponentValue}} */
    set values(vals) {
        for (const key in vals) {
            if (key in this.__valueComponents) {
                this.__valueComponents[key].value = vals[key];
            }
        }
    }

    /**Resets the values back to the originally set value before user influence*/
    resetValues() {
        for (const key in vals) {
            if (key in this.__valueComponents) {
                this.__valueComponents[key].resetValue();
            }
        }
    }
}
customElements.define(Group.elementName, Group);
export let group = Group.create;


/**Defines options for group component 
 * @typedef {Object} CollapsibleGroupComponentInternalOptions
 * @property {boolean} collapsed 
 * 
 * Defines options for group component 
 * @typedef {GroupComponentOptions & CollapsibleGroupComponentInternalOptions} CollapsibleGroupComponentOptions*/

export class CollapsibleGroup extends Group {
    constructor() {
        super();
        this.appendChild(this.__container = document.createElement('div'));
        this.appendChild(this.__collapser = document.createElement('span')).tabIndex = 0;
        this.__collapser.appendChild(this.__text = document.createElement('div'));
        this.__collapser.appendChild(unfold_less());
        this.__collapser.onclick = () => {
            this.collapsed = !this.collapsed;
        };
        this.__collapser.onkeyup = (e) => {
            switch (e.key) {
                case ' ':
                case 'Enter': { this.collapsed = !this.collapsed; }
            }
        };
    }

    /**Options toggeler
     * @param {CollapsibleGroupComponentOptions} options*/
    options(options) {
        super.options(options)
        if (typeof options.collapsed === 'boolean') {
            this.collapsed = options.collapsed;
        }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() {
        return componentNameStart + 'collapsiblegroup'
    };

    /**Creates an instance of the component group
     * @param {CollapsibleGroupComponentOptions} options
     * @returns {CollapsibleGroup} */
    static create(options) {
        if (!options) { console.warn('Parameter must be passed'); return; }
        let elem = new CollapsibleGroup(options);
        elem.options(options);
        return elem;
    }

    /**This sets if the group should be collapsed
     * @param {boolean}*/
    set collapsed(col) {
        if (col) {
            this.__container.classList.add('collapsed');
            this.__collapser.replaceChild(unfold_more(), this.__collapser.lastChild);
        } else {
            this.__container.classList.remove('collapsed');
            this.__collapser.replaceChild(unfold_less(), this.__collapser.lastChild);
        }
        this.__collapsed = Boolean(col);
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        super.__onAccess(a);
        switch (a) {
            case AccessTypes.READ: { this.__collapser.onfocus = () => { document.body.focus(); }; break; }
            case AccessTypes.WRITE: { this.__collapser.onfocus = null; break; }
        }
    }

    /**This gets if the group is collapsed
     * @returns {boolean}*/
    get collapsed() {
        return this.__collapsed;
    }

    /**Set text of collapser button*/
    set text(text) {
        this.__text.innerHTML = text;
    }
}
customElements.define(CollapsibleGroup.elementName, CollapsibleGroup);
export let collapsibleGroup = CollapsibleGroup.create;