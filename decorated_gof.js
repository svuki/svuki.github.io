const colors = {0 : 'white', 1: 'black' };

function draw_cell(ctx, cell_size, val, i, j) {
	let to_canv_coord = (i) => i * cell_size;
	let color = colors[val];
	ctx.fillStyle = color;
	ctx.fillRect(to_canv_coord(i), to_canv_coord(j), 10, 10);

}
function canvas_to_gof(canvas, cell_size=10) {
    //creates a game of life representation with corresponding dimensions
    //to the CANVAS and CELL_SIZE
    return new Gof(canvas.height / cell_size, canvas.width / cell_size);
}

function Decorated_gof(canvas, cell_size=10) {
    
    const ctx = canvas.getContext('2d');
    const from_canvas = (x) => Math.floor(x / cell_size);
    const to_canvas  = (i) => i * cell_size;
    let gof = canvas_to_gof(canvas, cell_size);
    const draw_cell = (val, i, j) => {
        let color = colors[val];
        ctx.fillStyle = color;
        ctx.fillRect(to_canvas(j), to_canvas(i), cell_size, cell_size);
    }
    this.show_gof = () => gof.cells.show();    
    this.gof = () => gof;
    this.toggle = (i,j) => {
        const val = gof.toggle(i,j);
        draw_cell(val, i, j);
    } 

     this.canvas_toggle = (x, y) => {
        const i = from_canvas(y);
        const j = from_canvas(x);
        this.toggle(i, j);
    }
    
    this.show = () => gof.cells.for_each( draw_cell );
    this.next = () => { 
        gof.next(); 
        this.show();
    }
    
    this.clear = () => {
	    gof.clear();
	    this.show();
    }

    this.saved_pattern = undefined;
    this.handle = (e_down_coords, e_up_coords) => {
        const i0 = from_canvas(e_down_coords[1]);
        const j0 = from_canvas(e_down_coords[0]);
        const i1 = from_canvas(e_up_coords[1]);
        const j1 = from_canvas(e_up_coords[0]);

        // if the events occur in the same pixel, toggle it
        if (i0 === i1 && j0 === j1) {
            this.toggle(i0, j0);
        }

        else {
            this.saved_pattern = gof.cells.rect(i0, j0, i1, j1);
        }
    }
    this.handle_merge = function(x,y) {
        if (this.saved_pattern) {
            gof.cells.merge(this.saved_pattern, from_canvas(y), from_canvas(x));
            this.show();
        }
    }
    this.save_gof = function() {
        return gof.copy();
    }
    this.load_gof = function(new_gof) {
        gof = new_gof.copy();
        this.show();
    }
    this.generation = () => gof.generation;        
    this.soup = function() {
       gof.soup();
       this.show();
    }
}
    
