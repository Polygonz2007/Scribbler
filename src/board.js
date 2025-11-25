// Defines a "board" class, which stores a canvas and functions for manipulating it.
// Many "baords" are stored on the server to allow clients to create, view, edit and delete them.


const Board = class {
    constructor(width, height) {
        // server or not
        if (document) {
            this.canvas = document.querySelector("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
        } else {
            const canvas = import("canvas");
            this.canvas = canvas.createCanvas(width, height);
        }

        this.context = this.canvas.getContext("2d");
    }

    stroke(type, sx, sy, ex, ey, size, color) {
        this.context.beginPath();
        this.context.moveTo(sx, sy);
        this.context.lineTo(ex, ey);
        this.context.lineWidth = size;
        this.context.strokeStyle = color;
        this.context.stroke();
    }
}

export default Board;