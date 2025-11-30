
import { State, board } from "/script.js";
import Viewer from "/viewer.js";

const Input = new class {
    constructor() {
        this.prev_pos = [0, 0];
        this.pos = [0, 0];
        this.left_click = false;
        this.right_click = false;
        this.keys = [];

        // Cursor
        this.cursor = document.querySelector("#cursor");

        // Mouse events
        window.addEventListener("mousemove", (e) => {
            this.pos = [e.clientX, e.clientY];
            this.cursor.style.left  = `${e.clientX}px`;
            this.cursor.style.top = `${e.clientY}px`;

            if (this.left_click) {
                switch (State.tool) {
                    case "grab":
                        Viewer.move_by(e.movementX, e.movementY);
                        return;

                    case "pen":
                    case "eraser":
                        // Move a minimum distance before a stroke
                        const delta_pos = [
                            this.pos[0] - this.prev_pos[0],
                            this.pos[1] - this.prev_pos[1],
                        ];

                        // Use pythagoras to find distance moved. Instead of having to square root (slow), square min distance to get same result faster.
                        if (delta_pos[0] * delta_pos[0] + delta_pos[1] * delta_pos[1] > State.min_dist * State.min_dist) {
                            // Translate screen space to board space
                            const start = Viewer.screen_to_canvas_coords(this.prev_pos);
                            const end = Viewer.screen_to_canvas_coords(this.pos);

                            // draw
                            const color = (State.tool == "eraser") ? "#FFF" : State.color;
                            board.create_stroke("pen", start, end, State.size, color);
                            this.prev_pos = this.pos;
                        }
                        
                        return;
                }
            } else {
                // Make sure that new stroke always starts at start of click
                this.prev_pos = this.pos;

                // Move when holding space
                if (this.isKeyDown(" "))
                    Viewer.move_by(e.movementX, e.movementY);
            }
        });

        // Do not fire if above an UI element such as controls
        window.addEventListener("mousedown", (e) => {
            if (e.target.id != "main-canvas")
                return;

            if (e.button == 0) {
                this.left_click = true;

                // Let there be circles (if user presses without moving mouse, something needs to be drawn)
                if (State.tool != "pen")
                    return; 

                const press_pos = Viewer.screen_to_canvas_coords(this.pos);
                board.create_stroke("pen", press_pos, press_pos, State.size, State.color);
            }
        });

        // Release
        window.addEventListener("mouseup", (e) => {
            if (e.button == 0)
                this.left_click = false;
        });

        // Scaling
        window.addEventListener("wheel", (e) => {
            Viewer.scale_by(1 - (e.deltaY * 0.001), this.pos);
            Input.cursor.style.width  = `${State.size * Viewer.scale}px`;
            Input.cursor.style.height = `${State.size * Viewer.scale}px`;
        });

        // Keyboard events
        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    isKeyDown(key) {
        return this.keys[key];
    }
}

export default Input;



// Change tool
const tools = document.querySelectorAll("#brush > img");
for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    tool.addEventListener("click", () => {
        State.tool = tool.id;
        document.querySelector("#brush > .selected").classList.remove("selected");
        tool.classList.add("selected");
    });
}

// Change color
const color_picker = document.querySelector("input[type=color]");
const color_picker_text = document.querySelector("#color-hex");
color_picker.addEventListener("input", () => {
    State.color = color_picker.value;
    color_picker_text.innerText = State.color;
    Input.cursor.style.backgroundColor = `${State.color}22`; // Color at 0x22 opacity
});

// Change size
const size_picker = document.querySelector("input[type=range]");
size_picker.addEventListener("input", () => {
    State.size = size_picker.value;
    Input.cursor.style.width  = `${State.size * Viewer.scale}px`;
    Input.cursor.style.height = `${State.size * Viewer.scale}px`;
});

// On startup
State.color = color_picker.value;
State.size = size_picker.value;

Input.cursor.style.backgroundColor = `${State.color}22`; // Color at 0x22 opacity
Input.cursor.style.width  = `${State.size}px`;
Input.cursor.style.height = `${State.size}px`;

color_picker_text.innerText = State.color;