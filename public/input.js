
import { State, board } from "/script.js";
import Viewer from "/viewer.js";

const Input = new class {
    constructor() {
        this.prev_pos = [0, 0];
        this.pos = [0, 0];
        this.left_click = false;
        this.right_click = false;

        // Add events
        window.addEventListener("mousemove", (e) => {
            this.pos = [e.clientX, e.clientY];

            // Replace with switch statement for different tools
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
                        if (delta_pos[0] * delta_pos[0] + delta_pos[1] + delta_pos[1] > State.min_dist * State.min_dist) {
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
            }

                
        });

        // Do not fire if above an UI element such as controls
        window.addEventListener("mousedown", (e) => {
            if (e.button == 0) {
                this.left_click = true;

                // Let there be circles (if user presses without moving mouse, something needs to be drawn)
                if (State.tool != "pen")
                    return; 

                const press_pos = Viewer.screen_to_canvas_coords(this.pos);
                board.create_stroke("pen", press_pos, press_pos, State.size, State.color);
            }
            
            if (e.button == 2)
                this.right_click = true;
        });

        window.addEventListener("mouseup", (e) => {
            if (e.button == 0)
                this.left_click = false;

            if (e.button == 2)
                this.right_click = false;
        });

        window.addEventListener("wheel", (e) => {
            Viewer.scale_by(1 - e.deltaY * 0.001, this.pos);
        })
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
color_picker.addEventListener("input", () => {
    State.color = color_picker.value;
});

// Change size
const size_picker = document.querySelector("input[type=range]");
size_picker.addEventListener("input", () => {
    State.size = size_picker.value;
});