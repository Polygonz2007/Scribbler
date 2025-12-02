// Handles all interaction with the app.
// Selecting tools, colors, sizes, creating and deleting boards, drawing and panning and zooming.

import { State } from "/script.js";

const Viewer = new class {
    constructor() {
        this._canvas; // The canvas being displayed

        // At 0, 0 and scale 1, the canvas is centered and same size in pixels as screen.
        this.pos = [0, 0]; // Scaled.
        this.scale = 1;

        // Get screen dimensions
        this.get_screen();

        // Update if resized
        window.addEventListener("resize", () => {
            this.get_screen();
            this.apply();
        });
    }

    set canvas(canvas) {
        this._canvas = canvas;
        this.canvas_size = [canvas.width, canvas.height];
        
        this.apply();
    }

    get canvas() {
        return this._canvas;
    }

    get canvas_screen_ratio() {
        return [
            canvas.width / this.screen.width,
            canvas.height / this.screen.height
        ];
    }

    get_screen() {
        this.screen = [window.innerWidth, window.innerHeight];
    }

    screen_to_canvas_coords(pos) {
        let coords = [pos[0], pos[1]];

        // Screen to canvas pos
        coords[0] += -this.pos[0] + ((this.canvas_size[0] * this.scale) - this.screen[0]) * 0.5;
        coords[1] += -this.pos[1] + ((this.canvas_size[1] * this.scale) - this.screen[1]) * 0.5;

        // Scale
        coords[0] /= this.scale;
        coords[1] /= this.scale;

        return coords;
    }

    canvas_to_screen_coords(coords) {
        // Scale

        // Translate
        
    }

    move_by(xpx, ypx) {
        // Apply scale
        //xpx /= this.scale * 0.5;
        //ypx /= this.scale * 0.5;

        // Move
        this.pos = [this.pos[0] + xpx, this.pos[1] + ypx];

        // Update
        this.apply();
    }

    scale_by(scale, center) {
        // Scale
        const prev_scale = this.scale;
        this.scale *= scale;
        console.log(`Scaled by ${scale}x and are now at ${this.scale}x scale total`)
        const delta_scale = this.scale - prev_scale;

        // Translate cursor pos to viewer space
        const x_cursor = center[0] - (this.screen[0] / 2);
        const y_cursor = center[1] - (this.screen[1] / 2);

        // Find difference
        let x_delta = this.pos[0] - x_cursor;
        let y_delta = this.pos[1] - y_cursor;

        // Scale by change in scale and move canvas in opposite direction
        x_delta *= delta_scale;
        y_delta *= delta_scale;

        // fix the fact that this is wrong

        // Move
        //this.move_by(x_delta, y_delta);
        this.apply()
    }

    apply() {
        if (!this.canvas)
            return;

        this.canvas.style.left = `${this.pos[0] - (this.canvas_size[0] / 2) + (this.screen[0] / 2)}px`;
        this.canvas.style.top = `${this.pos[1] - (this.canvas_size[1] / 2) + (this.screen[1] / 2)}px`;

        this.canvas.style.scale = `${this.scale}`;
    }
}

Viewer.canvas = document.querySelector("canvas");

export default Viewer;