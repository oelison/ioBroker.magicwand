/*
 * Created with @iobroker/create-adapter v2.6.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import * as dgram from "dgram";
const inSocket = dgram.createSocket("udp4");

// Load your modules here, e.g.:
// import * as fs from "fs";

class Magicwand extends utils.Adapter {
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "magicwand",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.setObjectNotExists("Spell", {
            type: "state",
            common: {
                name: "Spell",
                type: "string",
                role: "text",
                read: true,
                write: false,
            },
            native: {},
        });
        this.setObjectNotExists("House", {
            type: "state",
            common: {
                name: "House",
                type: "string",
                role: "text",
                read: true,
                write: false,
            },
            native: {},
        });
        this.setObjectNotExists("Patronus", {
            type: "state",
            common: {
                name: "Patronus",
                type: "string",
                role: "text",
                read: true,
                write: false,
            },
            native: {},
        });
        this.setObjectNotExists("FullSpell", {
            type: "state",
            common: {
                name: "FullSpell",
                type: "string",
                role: "text",
                read: true,
                write: false,
            },
            native: {},
        });
        inSocket.on("listening", () => {
            const address = inSocket.address();
            this.log.debug("UDP socket listening on " + address.address + ":" + address.port);
        });
        inSocket.on("message", (message, remote) => {
            this.log.debug("received: " + message.toString());
            if (message.toString().startsWith("spell:")) {
                const fullSpell = message.toString().substring(6);
                const dataOnly = fullSpell.split(":");
                if (dataOnly.length == 3) {
                    const spell = dataOnly[0];
                    const house = dataOnly[1];
                    const patronus = dataOnly[2];
                    this.setState("Spell", { val: spell, ack: true });
                    this.setState("House", { val: house, ack: true });
                    this.setState("Patronus", { val: patronus, ack: true });
                    this.setState("FullSpell", { val: fullSpell, ack: true });
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
    private onUnload(callback: () => void): void {
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
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
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
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Magicwand(options);
} else {
    // otherwise start the instance directly
    (() => new Magicwand())();
}
