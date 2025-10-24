import { AccessTypes, defineElement, type BaseOptions } from "@libBase";
import { grey } from "@libColors";
import { WebComponent } from "@libCommon";
import { chevron_right, expand_more, hourglass_empty } from "@libIcons";
import { addThemeVariable } from "@libTheme";
import { ListCell } from "./listerCells";
import "./listerRow.scss";

addThemeVariable("listerHoverColor", ["Lister"], grey["500"], grey["600"]);

/**Defines options for list row component*/
export type ListRowOptions = {
  /**list of rows to add as child rows */
  rows?: ListRow[];
  /** cells to add to row */
  cells?: ListCell[];
  /**whether the row is openable */
  openable?: boolean;
  /**symbol for row */
  symbol?: SVGSVGElement;
} & BaseOptions;

export class ListRow<
  Options extends ListRowOptions = ListRowOptions
> extends WebComponent<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lister-row";
  }

  /**Whether the row is opened*/
  private ___isOpen = false;
  /**The child rows of the row*/
  private ___rows: ListRow[] = [];
  /**The cells in the row*/
  private ___cells: ListCell[] = [];
  /**Whether the row is openable*/
  private ___openable = false;
  /**Stores opener*/
  private ___opener: HTMLDivElement;
  /**Stores the rows indent in the list*/
  private ___indent: number = 0;
  /**Stores the symbol*/
  private ___symbol?: SVGSVGElement;

  private ___openerCancel: ((e: any) => void) | undefined;
  ___top?: any;
  private ___par?: this;

  constructor() {
    super();
    this.addEventListener("keydown", this.___onkeydown);
    this.classList.add("lister-row");
    let opener = this.appendChild(document.createElement("div"));
    opener.classList.add("opener");
    this.___opener = opener.appendChild(document.createElement("div"));
    this.setAttribute("tabIndex", "0");
  }

  /**Options toggeler*/
  options(options: Options): this {
    super.options(options);
    if (options.rows instanceof Array)
      for (let i = 0, n = options.rows.length; i < n; i++)
        this.addRow(options.rows[i]);
    if (options.cells instanceof Array)
      for (let i = 0, n = options.cells.length; i < n; i++)
        this.addCell(options.cells[i]);
    if (options.openable) this.openable = true;
    if (options.symbol) this.symbol = options.symbol;
    return this;
  }

  /**Cancels async row loading if the row is disconnected*/
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.___openerCancel) {
      this.___openerCancel(this);
      return;
    }
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes): void {
    super.__onAccess(a);
    switch (a) {
      case AccessTypes.READ:
        this.addEventListener("focusin", (e) => {
          e.preventDefault();
        });
    }
  }

  /**Sets the indentation of the row/ how far the row is set in from the left*/
  set indentation(indent: number) {
    (this.firstChild as HTMLElement).style.paddingLeft = indent + "rem";
    this.___indent = indent;
  }

  /**This sets or changes the symbol of the row*/
  set symbol(sym: SVGSVGElement) {
    if (sym instanceof SVGSVGElement) {
      this.___symbol = this.___opener.appendChild(sym);
      this.___symbol.classList.add("sym");
    } else if (this.___symbol) {
      this.___symbol.remove();
    }
  }

  /**This method changes wether the row can be opened*/
  set openable(x: boolean) {
    if (x && !this.___openable) {
      //@ts-expect-error
      this.___opener.symbol = this.___opener.insertBefore(
        chevron_right(),
        this.___opener.firstChild
      );
      let dis = this;
      this.___opener.onclick = () => {
        dis.open = !dis.___isOpen;
      };
    } else if (!x && this.___openable) {
      //@ts-expect-error
      this.___opener.removeChild(this.___opener.symbol);
      this.___opener.onclick = () => {};
    }
    this.___openable = Boolean(x);
  }

  /**Wether the row is openable*/
  get openable(): boolean {
    return this.___openable;
  }

  /**This method opens or closes the row if it has children
   * @param x true is open, false is close*/
  set open(x: boolean) {
    if (this.___openable) {
      if (this.___openerCancel) {
        this.___openerCancel(this);
        return;
      }
      (async () => {
        if (x && !this.___isOpen && typeof this.openFunc == "function") {
          try {
            var res: any = this.openFunc();
            if (res instanceof Promise) {
              this.___OpenerIcon = hourglass_empty();
              let dis = this;
              res = await Promise.race([
                res,
                new Promise((_a, b) => {
                  dis.___openerCancel = b;
                }),
              ]);
              delete this.___openerCancel;
            }
          } catch (e) {
            delete this.___openerCancel;
            if (e != this) {
              console.error(e);
            }
            this.___OpenerIcon = chevron_right();
            return;
          }
          if (res instanceof Array) {
            for (let i = 0, n = res.length; i < n; i++) {
              this.addRow(res[i]);
            }
          }
          this.___isOpen = true;
          this.___OpenerIcon = expand_more();
        } else if (!x && this.___isOpen) {
          try {
            var res: any = this.closeFunc();
          } catch (e) {
            console.error(e);
            return;
          }
          if (!res) {
            for (let i = 0, m = this.___rows.length; i < m; i++) {
              let e = this.___rows[i];
              if (e.___isOpen) {
                e.open = false;
              }
              this.___top.___rowContainer.removeChild(e);
              delete e.___par;
              delete e.___top;
            }
            this.___rows = [];
            this.___isOpen = false;
            this.___OpenerIcon = chevron_right();
          }
        }
      })();
    }
  }

  /**This method returns wether the row is open*/
  get open(): boolean {
    return this.___isOpen;
  }

  /**This removes all child rows from the*/
  empty() {
    for (let i = 0; i < this.___rows.length; i++) {
      if (this.___rows[i].open) {
        this.___rows[i].open = false;
      }
      this.___top.___rowContainer.removeChild(this.___rows[i]);
    }
    this.___rows = [];
  }

  /**This removes all cells from the row*/
  emptyRow() {
    for (let i = 0, m = this.___cells.length; i < m; i++) {
      this.removeChild(this.___cells[i]);
    }
    this.___cells = [];
  }

  /**Add a row to the list*/
  addCell<C extends ListCell>(cell: C, index?: number): C {
    //If the row is already part of a list it is automatically removed
    if (cell.___par) {
      cell.___par.removeCell(cell);
    }
    if (index === 0) {
      this.insertBefore(cell, this.___cells[0]);
      this.___cells.unshift(cell);
    } else if (index) {
      this.insertBefore(cell, this.___cells[index]);
      this.___cells.splice(index, 0, cell);
    } else {
      this.appendChild(cell);
      this.___cells.push(cell);
    }
    cell.___par = this;
    return cell;
  }

  /**Removes row from list*/
  removeCell(cell: ListCell): ListCell {
    let index = this.___cells.indexOf(cell);
    if (index != -1) {
      this.removeChild(cell);
      this.___cells.splice(index, 1);
    }
    delete cell.___par;
    return cell;
  }

  /**Returns the next elemenent in the list*/
  get next(): HTMLElement {
    return this.nextSibling as HTMLElement;
  }

  /**Returns the previous elemenent in the list*/
  get previous(): HTMLElement {
    return this.previousSibling as HTMLElement;
  }

  /**Add a row to the list*/
  addRow(row: ListRow, index: number = Infinity): ListRow {
    //If the row is already part of a list it is automatically removed
    if (index === 0) {
      this.___top.___rowContainer.insertBefore(row, this.next);
      this.___rows.unshift(row);
    } else if (index < this.___rows.length) {
      this.___top.___rowContainer.insertBefore(row, this.___rows[index]);
      this.___rows.splice(index, 0, row);
    } else {
      this.___top.___rowContainer.insertBefore(row, this.__lastRow.next);
      this.___rows.push(row);
    }
    row.___top = this.___top;
    row.___par = this;
    row.indentation = this.___indent + 1;
    return row;
  }

  /**Removes row from list
   * @param row pass either the row to remove or the index of it*/
  removeRow(row: ListRow | number): ListRow {
    if (row instanceof ListRow) {
      var index = this.___rows.indexOf(row);
      if (index === -1) {
        throw new Error("Row not in list");
      }
    } else {
      if (row < 0 || row >= this.___rows.length) {
        throw new Error("Index not in list");
      }
      var index = row;
      row = this.___rows[index];
    }
    this.___top.___rowContainer.removeChild(row);
    this.___rows.splice(index, 1);
    delete row.___par;
    delete row.___top;
    return row;
  }

  /**Removes self from list*/
  remove() {
    this.___par?.removeRow(this);
  }

  /**Returns the index of the row in its parent */
  get index(): number | undefined {
    if (this.___par) {
      return this.___par.___rows.indexOf(this);
    }
    return undefined;
  }

  /**This sorts the child rows of the row
   * @param func function which is run for every row following the standard array sort*/
  sortRows(func: (a: any, b: any) => number, recurs: boolean) {
    let rows = this.getRows();
    rows.sort(func);
    for (let i = rows.length - 1; 0 <= i; i--) {
      this.addRow(rows[i], 0);
    }
    if (recurs) {
      //@ts-expect-error
      for (let i = 0, m = this.___rowContainer; i < m; i++) {
        //@ts-expect-error
        this.___rowContainer[i].sortRows(func, true);
      }
    }
  }

  /**This returns all the child rows
   * @param recurs set true to run on all rows recursivly*/
  getRows(recurs: boolean = false) {
    let rows = [...this.___rows];
    if (recurs) {
      for (let i = 0, m = this.___rows.length; i < m; i++) {
        //@ts-expect-error
        rows.push(this.___rows[i].getRows(true));
      }
    }
    return rows;
  }

  /**This runs a function on all child rows
   * @param func function to run on all rows
   * @param recurs set true to run on all rows recursivly*/
  runFuncRows(func: (row: ListRow) => void, recurs: boolean) {
    for (let i = 0, m = this.___rows.length; i < m; i++) {
      func(this.___rows[i]);
      if (recurs) {
        this.___rows[i].runFuncRows(func, true);
      }
    }
  }

  /**Overwriteable function for opening the row
   * @returns must return an array of the rows to add when opening*/
  async openFunc(): Promise<ListRow[]> {
    return [];
  }

  /**Overwriteable function for closing the row
   * return true to block closing*/
  closeFunc(): boolean {
    return false;
  }

  /**Returns the last row in the rows children or itself if no children*/
  get __lastRow(): ListRow {
    return this.___rows[this.___rows.length - 1] || this;
  }

  /**This changes out the opener icon*/
  set ___OpenerIcon(icon: SVGSVGElement) {
    //@ts-expect-error
    this.___opener.replaceChild(icon, this.___opener.symbol);
    //@ts-expect-error
    this.___opener.symbol = icon;
  }

  /**Key handler for list row*/
  private ___onkeydown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight": {
        this.open = true;
        break;
      }
      case "ArrowLeft": {
        this.open = false;
        break;
      }
      case "ArrowUp": {
        ((this.previousSibling as HTMLElement) || { focus: () => {} }).focus();
        break;
      }
      case "ArrowDown": {
        ((this.nextSibling as HTMLElement) || { focus: () => {} }).focus();
        break;
      }
      default: {
        return;
      }
    }
    e.preventDefault();
  }
}
defineElement(ListRow);
