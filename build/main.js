"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var dgram = __toESM(require("dgram"));
const inSocket = dgram.createSocket("udp4");
class Magicwand extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "magicwand"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.setObjectNotExists("Spell", {
      type: "state",
      common: {
        name: "Spell",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    this.setObjectNotExists("House", {
      type: "state",
      common: {
        name: "House",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    this.setObjectNotExists("Patronus", {
      type: "state",
      common: {
        name: "Patronus",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    this.setObjectNotExists("IP", {
      type: "state",
      common: {
        name: "IP",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    this.setObjectNotExists("FullSpell", {
      type: "state",
      common: {
        name: "FullSpell",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    this.setObjectNotExists("FullSpellIP", {
      type: "state",
      common: {
        name: "FullSpellIP",
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    });
    inSocket.on("listening", () => {
      const address = inSocket.address();
      this.log.debug("UDP socket listening on " + address.address + ":" + address.port);
    });
    inSocket.on("message", (message, remote) => {
      this.log.debug("received: " + message.toString() + " from ip: " + remote.address);
      if (message.toString().startsWith("spell:")) {
        const fullSpell = message.toString().substring(6);
        const ipFromSender = remote.address;
        const fullSpellIP = fullSpell + ":" + ipFromSender;
        const dataOnly = fullSpell.split(":");
        if (dataOnly.length == 3) {
          const spell = dataOnly[0];
          const house = dataOnly[1];
          const patronus = dataOnly[2];
          this.setState("IP", { val: ipFromSender, ack: true });
          this.setState("Spell", { val: spell, ack: true });
          this.setState("House", { val: house, ack: true });
          this.setState("Patronus", { val: patronus, ack: true });
          this.setState("FullSpell", { val: fullSpell, ack: true });
          this.setState("FullSpellIP", { val: fullSpellIP, ack: true });
        } else {
          this.log.error("Mal formated spell. Muggel tech not able to read that.");
        }
      } else {
        this.log.debug("Not a spell. Muggle tech failure?");
      }
    });
    inSocket.bind(8888);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      inSocket.close();
      callback();
    } catch (e) {
      callback();
    }
  }
  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
  //     if (obj) {
  //         // The object was changed
  //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  //     } else {
  //         // The object was deleted
  //         this.log.info(`object ${id} deleted`);
  //     }
  // }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  */
  // private onMessage(obj: ioBroker.Message): void {
  //     if (typeof obj === "object" && obj.message) {
  //         if (obj.command === "send") {
  //             // e.g. send email or pushover or whatever
  //             this.log.info("send command");
  //             // Send response in callback if required
  //             if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
  //         }
  //     }
  // }
}
if (require.main !== module) {
  module.exports = (options) => new Magicwand(options);
} else {
  (() => new Magicwand())();
}
//# sourceMappingURL=main.js.map
