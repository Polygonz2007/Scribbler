// Defines a "board" class, which stores a canvas and functions for manipulating it.
// Many "baords" are stored on the server to allow clients to create, view, edit and delete them.

import Comms from "/comms.js";

const Board = class {
    constructor(width, height) {
        this.width = width || 1;
        this.height = height || 1;
        this.id = 0;
        
        // Use on screen canvas and use comms
        this.canvas = document.querySelector("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.context = this.canvas.getContext("2d");

        // Fill white
        this.context.fillStyle = "#FFF";
        this.context.fillRect(0, 0, this.width, this.height);
    }

    async load() {
        // Get image
        console.log("dap")
        const image_data = await Comms.fetch_json("/board/1");
        console.log("dop")

        // Use on screen canvas and use comms
        this.canvas = document.querySelector("canvas");
        this.canvas.width = image_data.width;
        this.canvas.height = image_data.height;

        this.context = this.canvas.getContext("2d");

        // Fill with image
        const img = new Image();
        img.src = image_data.data;
        console.log(image_data.data)
        img.onload = () => {
            this.context.drawImage(img, 0, 0);
        };
    }

    async create_stroke(tool, start, end, size, color) {
        // Tell server about this
        const result = await Comms.ws_req({
            type: "stroke",
            tool: tool,
            board_id: this.id,
            start: start,
            end: end,
            size: size,
            color: color
        });

        if (result.status == true)
            return true; // YAY!!!
    }

    draw_stroke(tool, start, end, size, color) {
        // Paint end caps for smoother lines
        this.draw_circle(start, size, color);
        this.draw_circle(end, size, color);

        // Paint the line itself 🤑
        this.context.beginPath();
        this.context.moveTo(start[0], start[1]);
        this.context.lineTo(end[0], end[1]);
        this.context.lineWidth = size;
        this.context.strokeStyle = color;
        this.context.stroke();
    }

    // 😘 https://stackoverflow.com/questions/25095548/how-to-draw-a-circle-in-html5-canvas-using-javascript
    draw_circle(pos, diameter, fill) {
        this.context.beginPath()
        this.context.arc(pos[0], pos[1], diameter / 2, 0, 2 * Math.PI, false)

        this.context.fillStyle = fill
        this.context.fill()
    }
}

export default Board;