// /**Event class
//  * contains the needed data to dispatch an event*/
// export class E {
//   readonly type?: string;
//   readonly target?: {};
//   data?: { [key: string]: any };
//   /**Any data to pass to the event listeners must be given in the constructor
//    * @param data parameters to pass to the listeners*/
//   constructor(data?: {}) {
//     this.data = data;
//   }
// }

// /**Type for event listener function*/
// export type EListener = (event: E) => boolean;

// //###############################################################################################################################################################
// //#     _____ _                 _        ______               _     _    _                 _ _              #####################################################
// //#    / ____(_)               | |      |  ____|             | |   | |  | |               | | |             #####################################################
// //#   | (___  _ _ __ ___  _ __ | | ___  | |____   _____ _ __ | |_  | |__| | __ _ _ __   __| | | ___ _ __    #####################################################
// //#    \___ \| | '_ ` _ \| '_ \| |/ _ \ |  __\ \ / / _ \ '_ \| __| |  __  |/ _` | '_ \ / _` | |/ _ \ '__|   #####################################################
// //#    ____) | | | | | | | |_) | |  __/ | |___\ V /  __/ | | | |_  | |  | | (_| | | | | (_| | |  __/ |      #####################################################
// //#   |_____/|_|_| |_| |_| .__/|_|\___| |______\_/ \___|_| |_|\__| |_|  |_|\__,_|_| |_|\__,_|_|\___|_|      #####################################################
// //#                      | |                                                                                #####################################################
// //#                      |_|                                                                                #####################################################
// //###############################################################################################################################################################

// /**Defines the layout of the storage of sub event listeners*/
// type SimpleEventStorage = {
//   [s: string]: EListener[];
// };

// /**Defines the layout of the sub event listener addition options*/
// export type SimpleEventOptions = {
//   /*wether to only listen for the event once then the listener will remove itself*/
//   once?: boolean;
// };

// /**Simple event handler class
//  * Can be extended to other classes which needs event handling*/
// export class SimpleEventHandler {
//   ___simpleListeners___?: SimpleEventStorage;

//   /**Any data to pass to the event listeners must be given in the constructor
//    * @param  types parameters to pass to the listeners*/
//   constructor(types: string[]) {
//     this.initEHandler(types);
//   }

//   /**This initializes the event handler with a preset of event types
//    * it must be called during construction or types must be provided to attacher
//    * @param  types */
//   initEHandler(types: string[]) {
//     if (typeof this.___simpleListeners___ !== "object")
//       this.___simpleListeners___ = {};
//     for (let i = 0, n = types.length; i < n; i++)
//       this.___simpleListeners___[types[i]] = [];
//   }

//   /**This add the listener to the event handler
//    * @param  type which event to add
//    * @param  listener the listener function to add, return true to remove listener when called
//    * @param  options options for adding listener*/
//   addEListener<T extends EListener>(
//     types: string | string[],
//     listener: T,
//     options?: SimpleEventOptions
//   ): T {
//     let listenerSave = listener as EListener;
//     if (typeof types === "string") types = [types];
//     for (let i = 0, n = types.length; i < n; i++)
//       if (types[i] in this.___simpleListeners___!) {
//         if (options && options.once) {
//           listenerSave = (e) => {
//             listener(e);
//             return true;
//           };
//         }
//         let type = this.___simpleListeners___![types[i]];
//         let index = type.indexOf(listenerSave);
//         if (index == -1) type.push(listenerSave);
//         else console.warn("Listener already in handler");
//       } else console.warn("Listener type not in handler");
//     return listener;
//   }

//   /**This removes the listener from the event handler
//    * @param types which event to remove
//    * @param listener the listener function to remove*/
//   removeEListener<T extends EListener>(
//     types: string | string[],
//     listener: T
//   ): T {
//     if (typeof types === "string") types = [types];
//     for (let i = 0, n = types.length; i < n; i++)
//       if (types[i] in this.___simpleListeners___!) {
//         let type = this.___simpleListeners___![types[i]];
//         let index = type.indexOf(listener);
//         if (index != -1) type.splice(index, 1);
//         else console.warn("Listener not in handler");
//       } else console.warn("Listener type not in handler");
//     return listener;
//   }

//   /**This dispatches the event
//    * event object will be frozen
//    * @param  type which event to dispatch
//    * @param  event event object*/
//   dispatchE(type: string, event: E = new E()) {
//     if (!Object.isFrozen(event)) {
//       //@ts-expect-error
//       event.type = type;
//       //@ts-expect-error
//       event.target = this;
//     }
//     Object.freeze(event);
//     let funcs = this.___simpleListeners___![type];
//     if (funcs.length > 0) {
//       if (funcs.length > 1) funcs = [...funcs];
//       for (let i = 0, n = funcs.length; i < n; i++)
//         try {
//           if (funcs[i](event)) {
//             funcs.splice(i, 1);
//             n--;
//             i--;
//           }
//         } catch (e) {
//           console.warn("Failed while dispatching event", e);
//         }
//     }
//   }
//   /**This removes all listeners of a type from the event handler
//    * @param  type which event to reset*/
//   resetEListeners(type: string | string[]) {
//     if (typeof type === "string") type = [type];
//     for (let i = 0, n = type.length; i < n; i++)
//       if (type[i] in this.___simpleListeners___!)
//         this.___simpleListeners___![type[i]] = [];
//       else console.warn("Listener type not in handler");
//   }
// }

// /**This attaches a simple event handler to the given object
//  * @param object the object to attach to
//  * @param types optional types to instantly initialize handler */
// export let attachSimpleEventHandler = (object: any, types?: string[]) => {
//   let prot = SimpleEventHandler.prototype;
//   object.initEHandler = prot.initEHandler;
//   if (types) object.initEHandler(types);
//   object.addEListener = prot.addEListener;
//   object.removeEListener = prot.removeEListener;
//   object.dispatchE = prot.dispatchE;
//   object.resetEListeners = prot.resetEListeners;
// };

// //###################################################################################################################################################################
// //#     _____       _     ______               _   _    _                 _ _              ##########################################################################
// //#    / ____|     | |   |  ____|             | | | |  | |               | | |             ##########################################################################
// //#   | (___  _   _| |__ | |____   _____ _ __ | |_| |__| | __ _ _ __   __| | | ___ _ __    ##########################################################################
// //#    \___ \| | | | '_ \|  __\ \ / / _ \ '_ \| __|  __  |/ _` | '_ \ / _` | |/ _ \ '__|   ##########################################################################
// //#    ____) | |_| | |_) | |___\ V /  __/ | | | |_| |  | | (_| | | | | (_| | |  __/ |      ##########################################################################
// //#   |_____/ \__,_|_.__/|______\_/ \___|_| |_|\__|_|  |_|\__,_|_| |_|\__,_|_|\___|_|      ##########################################################################
// //###################################################################################################################################################################
// //This event handler allows for listeners to specify more precisely what to listen to, to prevent too many listeners on the same event doing nothing

// /**Defines the layout of the storage of sub event listeners*/
// type SubEventStorage = {
//   [s: string]: { $_f_$: EListener[]; $_s_$?: SubEventStorage };
// };

// /**Defines the layout of the sub event listener addition options*/
// type SubEventDispatchOptions = {
//   /** tree list of sub event to listen to example ['a','b','c'] listens to sub event 'c' in subevent 'b' in subevent 'a' in event type */
//   sub?: string[];
// };
// export type SubEventOptions = SimpleEventOptions & SubEventDispatchOptions;

// /**Simple event handler class
//  * Can be extended to other classes which needs event handling*/
// export class SubEventHandler {
//   ___simpleListeners___?: SubEventStorage;

//   /**Any data to pass to the event listeners must be given in the constructor
//    * @param types parameters to pass to the listeners*/
//   constructor(types: string[]) {
//     this.initEHandler(types);
//   }

//   /**This initializes the event handler with a preset of event types
//    * it must be called during construction or types must be provided to attacher*/
//   initEHandler(types: string[]) {
//     if (typeof this.___simpleListeners___ !== "object")
//       this.___simpleListeners___ = {};
//     for (let i = 0, n = types.length; i < n; i++)
//       this.___simpleListeners___[types[i]] = { $_f_$: [] };
//   }

//   /**This add the listener to the event handler
//    * @param  type which event to add
//    * @param  listener the listener function to add, return true to remove listener when called
//    * @param  options the options for the listener*/
//   addEListener<T extends EListener>(
//     types: string | string[],
//     listener: T,
//     options?: SubEventOptions
//   ): T {
//     let listenerSave = listener as EListener;
//     if (typeof types === "string") types = [types];
//     for (let i = 0, n = types.length; i < n; i++)
//       if (types[i] in this.___simpleListeners___!) {
//         //Handles listeners with the once options
//         if (options && options.once) {
//           listenerSave = ((e: E) => {
//             listener(e);
//             return true;
//           }) as any;
//         }
//         let type = this.___simpleListeners___![types[i]];
//         if (options && options.sub instanceof Array) {
//           for (let i = 0, n = options.sub.length; i < n; i++) {
//             if (!("$_s_$" in type)) type["$_s_$"] = {};

//             //@ts-expect-error
//             if (!(options.sub[i] in type["$_s_$"]))
//               //@ts-expect-error
//               type["$_s_$"][options.sub[i]] = { $_f_$: [] };
//             //@ts-expect-error
//             type = type["$_s_$"][options.sub[i]];
//           }
//         }
//         let index = type["$_f_$"].indexOf(listenerSave);
//         if (index == -1) type["$_f_$"].push(listenerSave);
//         else console.warn("Listener already in handler");
//       } else console.warn("Listener type not in handler");
//     return listener;
//   }

//   /**This removes the listener from the event handler
//    * @param  types which event to remove
//    * @param  listener the listener function to remove
//    * @param  options the options for the listener*/
//   removeEListener<T extends EListener>(
//     types: string | string[],
//     listener: T,
//     options?: SubEventOptions
//   ): T {
//     if (typeof types === "string") types = [types];
//     for (let i = 0, n = types.length; i < n; i++)
//       if (types[i] in this.___simpleListeners___!) {
//         let type = this.___simpleListeners___![types[i]];
//         if (options && options.sub instanceof Array) {
//           for (let i = 0, n = options.sub.length; i < n; i++) {
//             if (type["$_s_$"]) {
//               if (!(options.sub[i] in type["$_s_$"])) {
//                 console.warn("Listener not in handler");
//                 return listener;
//               }
//               type = type["$_s_$"][options.sub[i]];
//             } else {
//               console.warn("Listener not in handler");
//               return listener;
//             }
//           }
//         }
//         let index = type["$_f_$"].indexOf(listener);
//         if (index != -1) type["$_f_$"].splice(index, 1);
//         else console.warn("Listener not in handler");
//       } else console.warn("Listener type not in handler");
//     return listener;
//   }

//   /**This dispatches the event
//    * @param  type which event to dispatch
//    * @param  event event object */
//   dispatchE(
//     type: string,
//     event: E = new E(),
//     options?: SubEventDispatchOptions
//   ) {
//     //@ts-expect-error
//     event.type = type;
//     //@ts-expect-error
//     event.target = this;
//     Object.freeze(event);
//     let typ = this.___simpleListeners___![type];
//     if (options && options.sub instanceof Array) {
//       for (let i = 0, n = options.sub.length + 1; i < n; i++) {
//         this.__dispatchLevel(typ["$_f_$"], event);
//         if (typ["$_s_$"]) {
//           if (!(options.sub[i] in typ["$_s_$"])) break;
//           typ = typ["$_s_$"][options.sub[i]];
//         } else break;
//       }
//     } else this.__dispatchLevel(typ["$_f_$"], event);
//   }
//   /**Dispatches a sub level in the handler*/
//   private __dispatchLevel(funcs: EListener[], event: E) {
//     if (funcs.length > 0) {
//       if (funcs.length > 1) funcs = [...funcs];
//       for (let i = 0, n = funcs.length; i < n; i++)
//         try {
//           if (funcs[i](event)) {
//             funcs.splice(i, 1);
//             n--;
//             i--;
//           }
//         } catch (e) {
//           console.warn("Failed while dispatching event", e);
//         }
//     }
//   }

//   /**This removes all listeners of a type from the event handler
//    * @param type which event to remove*/
//   resetEListeners(type: string | string[]) {
//     if (typeof type === "string") type = [type];
//     for (let i = 0, n = type.length; i < n; i++)
//       if (type[i] in this.___simpleListeners___!)
//         this.___simpleListeners___![type[i]] = { $_f_$: [] };
//       else console.warn("Listener type not in handler");
//   }
// }
