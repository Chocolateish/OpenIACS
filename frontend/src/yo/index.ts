import { Ok, type Option } from "@result";
import { State, type StateSubscriber } from "@state";
import {
  StateArray,
  type StateArrayRead,
} from "../lib/common/state/stateArray";

class Base {}

class BaseAdd extends Base {
  #tag: State<string>;
  #name: State<string>;
  #description: State<string>;
  constructor(tag: string, name: string, description: string) {
    super();
    this.#tag = new State(Ok(tag));
    this.#name = new State(Ok(name));
    this.#description = new State(Ok(description));
  }
  get tag() {
    return this.#tag.readable;
  }
  get name() {
    return this.#name.writeable;
  }
  get description() {
    return this.#description.writeable;
  }
}

class History extends Base {
  #his: State<string>;
  constructor(text: string) {
    super();
    this.#his = new State(Ok(text));
  }
  get history() {
    return this.#his.readable;
  }
}

//A skill is something a character can do
class Skill extends BaseAdd {
  constructor(add: string, name: string, description: string) {
    super(add, name, description);
  }
}

class Class extends BaseAdd {
  #skills: StateArray<Skill>;

  constructor(
    add: string,
    name: string,
    description: string,
    skills: Skill[] = []
  ) {
    super(add, name, description);
    this.#skills = new StateArray(Ok(skills));
  }

  get skills() {
    return this.#skills.readable;
  }
}
class ClassInstance {
  readonly cl: Class;
  level: number;
  constructor(cl: Class, level: number) {
    this.cl = cl;
    this.level = level;
  }
}

//The attribute can be anything that is represented by a number, so a stat or currency
class Attribute extends BaseAdd {
  readonly defaultMinimum: Option<number>;
  readonly defaultMaximum: Option<number>;
  readonly defaultActual: number;
  constructor(
    add: string,
    name: string,
    description: string,
    minimum: Option<number>,
    maximum: Option<number>,
    actual: number
  ) {
    super(add, name, description);
    this.defaultMinimum = minimum;
    this.defaultMaximum = maximum;
    this.defaultActual = actual;
  }
  get instance() {
    return new AttributeInstance(
      this,
      this.defaultMinimum,
      this.defaultMaximum,
      this.defaultActual
    );
  }
}
class AttributeInstance {
  readonly attr: Attribute;
  minimum: Option<number>;
  maximum: Option<number>;
  actual: number;
  constructor(
    attr: Attribute,
    minimum: Option<number>,
    maximum: Option<number>,
    actual: number
  ) {
    this.attr = attr;
    this.minimum = minimum;
    this.maximum = maximum;
    this.actual = actual;
  }
}

class Item extends BaseAdd {
  #attributes: StateArray<Attribute>;
  #instances: StateArray<ItemInstance> = new StateArray();
  constructor(
    add: string,
    name: string,
    description: string,
    attributes: Attribute[] = []
  ) {
    super(add, name, description);
    this.#attributes = new StateArray(Ok(attributes));
  }
  get instance() {
    let inst = new ItemInstance(this);
    this.#instances.push(inst);
    return inst;
  }
  deleteInstance(instance: ItemInstance) {
    this.#instances.removeAllOf(instance);
  }
  get attibutes() {
    return this.#attributes.readable;
  }
  get instances() {
    return this.#instances.readable;
  }
}

class ItemInstance {
  #item: Item;
  #attributes: StateArray<AttributeInstance> = new StateArray();
  #attributeSub: StateSubscriber<StateArrayRead<Attribute>>;

  constructor(item: Item) {
    this.#item = item;
    this.#attributeSub = item.attibutes.subscribe((val) => {
      this.#attributes.applyStateArrayRead(val, (val) =>
        val.map((a) => a.instance)
      );
    }, true);
  }
  destroy() {
    this.#item.attibutes.unsubscribe(this.#attributeSub);
    this.#item.deleteInstance(this);
  }
}

class Loc extends BaseAdd {
  readonly history: Set<History>;
  readonly items: Set<ItemInstance>;
  constructor(
    add: string,
    name: string,
    description: string,
    history: History[] = [],
    items: ItemInstance[] = []
  ) {
    super(add, name, description);
    this.history = new Set(history);
    this.items = new Set(items);
  }
}

class Character extends BaseAdd {
  readonly history: Set<History>;
  readonly items: Set<ItemInstance>;
  readonly classes: Set<ClassInstance>;
  readonly attributes: Set<AttributeInstance>;
  constructor(
    add: string,
    name: string,
    description: string,
    history: History[] = [],
    items: ItemInstance[] = [],
    classes: ClassInstance[] = [],
    attributes: AttributeInstance[] = []
  ) {
    super(add, name, description);
    this.history = new Set(history);
    this.items = new Set(items);
    this.classes = new Set(classes);
    this.attributes = new Set(attributes);
  }
}

class StoryLine {}

function serialize() {}
function deserialize() {}
