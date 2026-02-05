import { Viewport } from "@libEditor";
import { err, ok, type Result } from "@libResult";
import type { StateSyncROSWS } from "@libState";
import { default as st, default as state } from "@libState";
import "./index.scss";
import "./lib/composition";

class Game {
  //Stores all facts in the game
  #fact_store = state.a.ros_ws.ok<Fact>([], true);
  push_fact(fact: Fact) {
    this.#fact_store.push(fact);
  }
  //Stores all entities in the game
  #entity_store = state.a.ros_ws.ok<Entity>([], true);
  push_entity(entity: Entity) {
    this.#entity_store.push(entity);
  }
}

class Part {
  readonly uuid: string;
  constructor(uuid: string = crypto.randomUUID()) {
    this.uuid = uuid;
  }
}

class Fact extends Part {
  #description;
  readonly description;
  readonly owner: Entity;
  #game: Game;

  constructor(game: Game, uuid: string, desc: string, owner: Entity) {
    super(uuid);
    this.#game = game;
    this.#description = st.s.ros_ws.ok(desc);
    this.description = this.#description.read_write;
    this.owner = owner;
    this.#game.push_fact(this);
  }
}

class Entity extends Part {
  #description;
  readonly description;
  #fact_store = state.a.ros_ws.ok<Fact>([], true);

  constructor(uuid: string, desc: string) {
    super(uuid);
    this.#description = st.s.ros_ws.ok(desc);
    this.description = this.#description.read_write;
  }
}

interface CharacterData {
  uuid: string;
  name: string;
}
class Character {
  readonly uuid: string;
  #name: StateSyncROSWS<string>;

  constructor(uuid: string = crypto.randomUUID(), name: string) {
    this.uuid = uuid;
    this.#name = st.s.ros_ws.ok(name);
  }

  static deserialize(data: Partial<CharacterData>): Result<Character, string> {
    if (!data.uuid) return err("Missing uuid");
    if (!data.name) return err("Missing name");
    return ok(new Character(data.uuid, data.name));
  }

  serialize(): CharacterData {
    return {
      uuid: this.uuid,
      name: this.#name.ok(),
    };
  }
}

const yo = state.l.ros.ok(() => 1);
yo.ok();

console.warn(Character.deserialize({ uuid: "1234", name: "Hero" }));

// document.getElementById("app")?.replaceChildren(example_page());

document.getElementById("app")?.replaceChildren(new Viewport());
