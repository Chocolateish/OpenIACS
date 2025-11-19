import type {
  STATE_ARRAY_READ,
  STATE_ARRAY_RES,
  STATE_SUB,
  STATE_SYNC_ROS,
  STATE_SYNC_ROS_WS,
} from "@libState";
import { default as st } from "@libState";
import { type Option, type Result } from "../lib/result";

class Base {}

class BaseAdd extends Base {
  #tag: STATE_SYNC_ROS<string>;
  #name: STATE_SYNC_ROS_WS<string>;
  #description: STATE_SYNC_ROS_WS<string>;
  constructor(tag: string, name: string, description: string) {
    super();
    this.#tag = st.s.ros.ok(tag);
    this.#name = st.s.ros_ws.ok(name);
    this.#description = st.s.ros_ws.ok(description);
  }
  get tag() {
    return this.#tag.readonly;
  }
  get name() {
    return this.#name.readwrite;
  }
  get description() {
    return this.#description.readwrite;
  }
}

class History extends Base {
  #his: STATE_SYNC_ROS<string>;
  constructor(text: string) {
    super();
    this.#his = st.s.ros.ok(text);
  }
  get history() {
    return this.#his.readonly;
  }
}

//A skill is something a character can do
class Skill extends BaseAdd {
  constructor(add: string, name: string, description: string) {
    super(add, name, description);
  }
}

class Class extends BaseAdd {
  #skills: STATE_ARRAY_RES<Skill>;

  constructor(
    add: string,
    name: string,
    description: string,
    skills: Skill[] = []
  ) {
    super(add, name, description);
    this.#skills = st.a.res_ws.ok(skills);
  }

  get skills() {
    return this.#skills.readonly;
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
  #attributes: STATE_ARRAY_RES<Attribute>;
  #instances: STATE_ARRAY_RES<ItemInstance> = st.a.res_ws.ok();
  constructor(
    add: string,
    name: string,
    description: string,
    attributes: Attribute[] = []
  ) {
    super(add, name, description);
    this.#attributes = st.a.res_ws.ok(attributes);
  }
  get instance() {
    let inst = new ItemInstance(this);
    this.#instances.push(inst);
    return inst;
  }
  deleteInstance(instance: ItemInstance) {
    this.#instances.delete(instance);
  }
  get attibutes() {
    return this.#attributes.readonly;
  }
  get instances() {
    return this.#instances.readonly;
  }
}

class ItemInstance {
  #item: Item;
  #attributes: STATE_ARRAY_RES<AttributeInstance> =
    st.a.res_ws.ok<AttributeInstance>([]);
  #attributeSub: STATE_SUB<Result<STATE_ARRAY_READ<Attribute>, string>>;

  constructor(item: Item) {
    this.#item = item;
    this.#attributeSub = item.attibutes.sub((val) => {
      this.#attributes.applyRead(val, (val) => val.map((a) => a.instance));
    }, true);
  }
  destroy() {
    this.#item.attibutes.unsub(this.#attributeSub);
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
