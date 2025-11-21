// Handles all interaction with the app.
// Selecting tools, colors, sizes, creating and deleting boards, drawing and panning and zooming.

const Input = new class {
    constructor() {
        this.mouse_pos_x = 0;
        this.mouse_pos_y = 0;
        this.left_click = false;
        this.right_click = false;

        // Add events
        window.addEventListener("mousemove", (e) => {
            this.mouse_pos_x = e.clientX;
            this.mouse_pos_y = e.clientY;

            if (this.left_click)
                Viewer.move_by(e.movementX, e.movementY);
        });

        window.addEventListener("mousedown", (e) => {
            if (e.button == 0)
                this.left_click = true;

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
            Viewer.scale_by(1 + e.deltaY * 0.001);
        })
    }
}

const Viewer = new class {
    constructor() {
        this._canvas; // The canvas being displayed

        // At 0, 0 and scale 1, the canvas is centered and same size in pixels as screen.
        this.xpos = 0;
        this.ypos = 0;
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
        this.x_canvas = canvas.width;
        this.y_canvas = canvas.height;
        
        this.apply();
    }

    get canvas() {
        return this._canvas;
    }

    get_screen() {
        this.x_screen = window.innerWidth;
        this.y_screen = window.innerHeight;
    }

    move_by(xpx, ypx) {
        // Apply scale
        xpx *= this.scale;
        ypx *= this.scale;

        // Move
        this.xpos += xpx;
        this.ypos += ypx;

        // Update
        this.apply();
    }

    scale_by(scale) {
        // Scale
        const prev_scale = this.scale;
        this.scale *= scale;
        const delta_scale = this.scale - prev_scale;

        // Translate cursor pos to viewer space
        const x_cursor = Input.mouse_pos_x - (this.x_screen / 2);
        const y_cursor = Input.mouse_pos_y - (this.y_screen / 2);

        // Find difference
        let x_delta = this.xpos - x_cursor;
        let y_delta = this.ypos - y_cursor;

        // Scale by change in scale and move canvas in opposite direction
        x_delta *= delta_scale;
        y_delta *= delta_scale;

        // Move
        this.move_by(x_delta, y_delta);
    }

    apply() {
        if (!this.canvas)
            return;

        this.canvas.style.left = `${this.xpos - (this.x_canvas / 2) + (this.x_screen / 2)}px`;
        this.canvas.style.top = `${this.ypos - (this.y_canvas / 2) + (this.y_screen / 2)}px`;

        this.canvas.style.scale = `${this.scale}`;
    }
}

Viewer.canvas = document.querySelector("canvas");