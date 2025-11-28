// does testing

import Board from "/board.js";
import Comms from "/comms.js";

export const board = new Board();
console.log("dip")
await board.load();

export const State = new class {
    constructor() {
        this.tool = "grab";
        this.size = 4;
        this.color = "#FF0000";

        this.min_dist = 3; // prevent spamming and make it look nicer
    }
}

window.addEventListener("serverUpdate", (evt) => {
    const data = evt.detail;

    switch (data.type) {
        case "stroke":
            board.draw_stroke(data.tool, data.start, data.end, data.size, data.color);
    }
});