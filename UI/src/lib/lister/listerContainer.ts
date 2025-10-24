import { defineElement, type BaseOptions } from "@libBase";
import { blue, grey } from "@libColors";
import { WebComponent } from "@libCommon";
import { drag_handle_vert } from "@libIcons";
import { addThemeVariable } from "@libTheme";
import "./listerContainer.scss";
import { ListRow } from "./listerRow";

addThemeVariable("listerBackGroundColor", ["Lister"], grey["50"], grey["900"]);
addThemeVariable("listerSizerHover", ["Lister"], blue["400"], blue["600"]);
addThemeVariable("listerSizerTouch", ["Lister"], grey["300"], grey["600"]);

/**Use flexbox to make list container fill container
 * if container is used inline, use max height to limit height
 */

//#########################################################################
//#    _      _     _      _____            _        _                    #
//#   | |    (_)   | |    / ____|          | |      (_)                   #
//#   | |     _ ___| |_  | |     ___  _ __ | |_ __ _ _ _ __   ___ _ __    #
//#   | |    | / __| __| | |    / _ \| '_ \| __/ _` | | '_ \ / _ \ '__|   #
//#   | |____| \__ \ |_  | |___| (_) | | | | || (_| | | | | |  __/ |      #
//#   |______|_|___/\__|  \_____\___/|_| |_|\__\__,_|_|_| |_|\___|_|      #
//#########################################################################

/**Defines options for list container*/
type ListContainerOptions = {
  /**headers for list */
  header?: string[];
  /**whether the list is has sizeable columns or if it is as small as possible */
  sizeable?: boolean;
  /**function to run when clicked */
  rows?: ListRow[];
  /**sets the max height of the container */
  maxHeight?: number | boolean;
} & BaseOptions;

export class ListContainer extends WebComponent<ListContainerOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lister-container";
  }

  /**The child rows of the row*/
  private ___rows: ListRow[] = [];
  /**Whether the columns are sizeable*/
  private __sizeable = true;
  /**Container for table, used for css reasons*/
  private ___container = this.appendChild(document.createElement("div"));
  /**Stores the table container*/
  private ___table = this.___container.appendChild(
    document.createElement("table")
  );
  /**Stores the headers internally*/
  ___headers?: string[];
  /**Stores the header row*/
  private ___header = this.___table
    .appendChild(document.createElement("thead"))
    .appendChild(document.createElement("tr"));
  /**Stores the headers opener cell*/
  private ___opener = this.___header.appendChild(document.createElement("th"));
  /**Stores the section, which all rows are put into*/
  private ___rowContainer = this.___table.appendChild(
    document.createElement("tbody")
  );

  constructor() {
    super();
    this.___opener.classList.add("opener");
  }

  /**Options toggeler*/
  options(options: ListContainerOptions): this {
    super.options(options);
    if (options.rows instanceof Array)
      for (let i = 0, n = options.rows.length; i < n; i++)
        this.addRow(options.rows[i]);
    if (options.header) this.header = options.header;
    if (typeof options.sizeable !== "undefined")
      this.sizeable = options.sizeable;
    if (options.rows instanceof Array)
      for (let i = 0, n = options.rows.length; i < n; i++)
        this.addRow(options.rows[i]);
    if (options.maxHeight) this.maxHeight = options.maxHeight;
    return this;
  }

  /**Add a row to the list*/
  addRow(row: ListRow, index: number = Infinity): ListRow {
    //If the row is already part of a list it is automatically removed
    if (index === 0) {
      this.___rowContainer.insertBefore(
        row,
        this.___rows.length === 0 ? undefined : (this.___rows[0] as any)
      );
      this.___rows.unshift(row);
    } else if (index < this.___rows.length) {
      this.___rowContainer.insertBefore(row, this.___rows[index]);
      this.___rows.splice(index, 0, row);
    } else {
      this.___rowContainer.appendChild(row);
      this.___rows.push(row);
    }
    row.___top = this;
    //@ts-expect-error
    row.___par = this;
    row.indentation = 0;
    return row;
  }

  /**Removes row from list
   * @param row pass either the row to remove or the index of it*/
  removeRow(row: ListRow | number): ListRow {
    if (row instanceof ListRow) {
      var index = this.___rows.indexOf(row);
      if (index === -1) throw new Error("Row not in list");
    } else {
      if (row < 0 || row >= this.___rows.length)
        throw new Error("Index not in list");
      var index = row;
      row = this.___rows[index];
    }
    this.___rowContainer.removeChild(row);
    this.___rows.splice(index, 1);
    //@ts-expect-error
    delete row.___par;
    delete row.___top;
    return row;
  }

  /**This removes all child rows from the*/
  empty() {
    for (let i = 0, m = this.___rows.length; i < m; i++) {
      if (this.___rows[i].open) this.___rows[i].open = false;
      this.___rowContainer.removeChild(this.___rows[i]);
    }
    this.___rows = [];
  }

  /**Set the max height of the list container in rems,
   * false vale scales with content, truthy value scales to container*/
  set maxHeight(max: number | boolean) {
    this.style.height = "unset";
    if (typeof max == "number") {
      this.style.maxHeight = max + "rem";
      this.___container.style.maxHeight = max + "rem";
    } else {
      this.style.maxHeight = "unset";
      this.___container.style.maxHeight = "unset";
      if (max) {
        this.style.height = "100%";
      }
    }
  }

  /**Sets the header of the list to a list of texts*/
  set header(heads: string[]) {
    this.___header.innerHTML = "";
    this.___header.appendChild(this.___opener);
    if (heads instanceof Array && heads.length > 0) {
      this.___header.classList.remove("h");
      this.___headers = heads;
      for (let i = 0, n = heads.length; i < n; i++) {
        this.___header.appendChild(
          new ListHeaderCell().options({ text: heads[i] })
        );
      }
    } else {
      this.___header.classList.add("h");
      this.___headers = [];
    }
  }

  /**Returns the current headers*/
  get header(): string[] {
    return this.___headers || [];
  }

  /**Changes whether the list is sizeable or always spans the full side*/
  set sizeable(size: boolean) {
    if (size && !this.__sizeable) {
      this.classList.remove("notSizeable");
    } else if (!size && this.__sizeable) {
      this.classList.add("notSizeable");
    }
    this.__sizeable = Boolean(size);
  }

  /**Returns if the list is sizeable*/
  get sizeable(): boolean {
    return this.__sizeable;
  }
}
defineElement(ListContainer);

//##################################################################
//#    _      _     _     _    _                _                  #
//#   | |    (_)   | |   | |  | |              | |                 #
//#   | |     _ ___| |_  | |__| | ___  __ _  __| | ___ _ __ ___    #
//#   | |    | / __| __| |  __  |/ _ \/ _` |/ _` |/ _ \ '__/ __|   #
//#   | |____| \__ \ |_  | |  | |  __/ (_| | (_| |  __/ |  \__ \   #
//#   |______|_|___/\__| |_|  |_|\___|\__,_|\__,_|\___|_|  |___/   #
//##################################################################

export type ListHeaderCellOptions = {
  /**Text of the header cell*/
  text: string;
} & BaseOptions;
class ListHeaderCell extends WebComponent<ListHeaderCellOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lister-header-cell";
  }

  /**Container for css purposes*/
  private __container = this.appendChild(document.createElement("div"));
  /**Text container*/
  private __text = this.__container
    .appendChild(document.createElement("div"))
    .appendChild(document.createTextNode(""));
  /**Sizer for cell*/
  private __sizer = this.__container.appendChild(document.createElement("div"));

  constructor() {
    super();
    this.__sizer.appendChild(drag_handle_vert());
    this.__sizer.onpointerup = this.__sizeEnd;
    this.__sizer.onpointerdown = this.__sizeStart;
  }

  /**Options toggeler*/
  options(options: ListHeaderCellOptions): this {
    this.__text.nodeValue = options.text;
    return super.options(options);
  }

  /**This can be passed to the sizer starter event*/
  private __sizeStart(e: PointerEvent) {
    (e.currentTarget! as HTMLElement).setPointerCapture(e.pointerId);
    let dis = (e.currentTarget! as HTMLElement).parentElement!.parentElement!;
    let x = e.clientX;
    let box = dis.getBoundingClientRect();
    (e.currentTarget! as HTMLElement).onpointermove = (ev) => {
      dis.style.width = box.width + (ev.clientX - x) + "px";
    };
  }

  /**This can be passed to the sizer ender event*/
  private __sizeEnd(e: PointerEvent) {
    (e.target! as HTMLElement).releasePointerCapture(e.pointerId);
    (e.target! as HTMLElement).onpointermove = null;
  }
}
defineElement(ListHeaderCell);
