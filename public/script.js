// does testing

import Board from "/board.js";
import Comms from "/comms.js";

const board = new Board(1280, 720);

window.addEventListener("serverUpdate", (evt) => {
    const data = evt.detail;
    console.log("taishi")
    console.log(data)

    board.stroke(data.type, data.sx, data.sy, data.ex, data.ey, data.size, data.color)
})