//functions related to projected game states on canvasas

function i_to_y(i_0, y_offset, cell_size) {
    return (i) => (i - i_0) * cell_size + y_offset;
}
function j_to_x(j_0, x_offset, cell_size) {
    return (j) => (j - j_0) * cell_size + x_offset;
}
function y_to_i(i_0, y_offset, cell_size) {
    return (y) => Math.floor( (y - y_offset) / cell_size + i_0);
}
function x_to_j(j_0, x_offset, cell_size) {
    return (x) => Math.floor( (x - x_offset) / cell_size + j_0);
}

function calculate_rectangle(canvas, gstate, cell_size) {
    //Returns the coordinates of the centered rectangle of gstate's cells that can
    //be shown with the given cell_size on the canvas
    const canv_rows = canvas.height / cell_size;
    const canv_cols = canvas.width / cell_size;

    const total_rows = gstate.cells.rows;
    const total_cols = gstate.cells.cols;

    const y_offset = ((canv_rows - Math.floor(canv_rows)) / 2) * cell_size;
    const x_offset = ((canv_cols - Math.floor(canv_cols)) / 2) * cell_size;

    const row_offset = (total_rows - canv_rows) / 2;
    const col_offset = (total_cols - canv_cols) / 2;

    //find the coordinates of the centered rectange of cells that can
    //be drawn in the given canvas
    const i_0 = Math.ceil(row_offset);
    const j_0 = Math.ceil(col_offset);
    const i_1 = Math.ceil(total_rows - row_offset);
    const j_1 = Math.ceil(total_cols - col_offset);
    return { i_0 : i_0,
	     j_0 : j_0,
	     i_1 : i_1,
	     j_1 : j_1,
	     y_offset : y_offset,
	     x_offset : x_offset
	   };
}

function Coordinate_handler(canvas, gstate, csize) {

    this.rectangle = undefined;
    this.cell_size = undefined;
    this.i_y = undefined;
    this.j_x = undefined;
    this.y_i = undefined;
    this.x_j = undefined;

    this.resize = function(new_size) {
	this.cell_size = new_size;
	this.rectangle = calculate_rectangle(canvas, gstate, this.cell_size);
	let r = this.rectangle;
	this.i_y = i_to_y(r.i_0, r.y_offset, this.cell_size);
	this.j_x = j_to_x(r.j_0, r.x_offset, this.cell_size);
	this.y_i = y_to_i(r.i_0, r.y_offset, this.cell_size);
	this.x_j = x_to_j(r.j_0, r.x_offset, this.cell_size);
    }

    this.resize(csize);
}

//Drawing
	
const colors = {0 : 'white', 1: 'black'};
function draw_cell_xy(ctx, cell_size, val, x, y) {
    let color = colors[val];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cell_size, cell_size);
}


function auto_cell_size(canvas, gstate) {
    const val = Math.max(gstate.cells.rows, gstate.cells.cols);
    return Math.floor(canvas.width / val);
}

function Projector(canvas){
    //projects the given game state at the given zoom level onto
    //the bound canvas
    let ctx = canvas.getContext('2d');
    let gstate = undefined;
    let cell_size = undefined;
    let rectangle = undefined;
    let i_y = undefined;
    let j_x = undefined;
    let whipe_b = false;
    
    this.initialize = function(gamestate, coordinate_handler) {
	gstate = gamestate.copy();
	this.resize(coordinate_handler);
    }

    this.whipe = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	whipe_b = true;
    }
    
    this.project = function(gamestate) {
	
	const r = rectangle;
	if (whipe_b) { //if the canvas was whiped, redraw every cell
	    whipe_b = false;
	    for (i = r.i_0; i <= r.i_1; i++)
		for(j = r.j_0; j <= r.j_1; j++)
		    draw_cell_xy(ctx, cell_size, gamestate.cells.at(i,j), j_x(j), i_y(i));
	}
	else { //otherwise only draw those cell whose value has changed
	    for (i = r.i_0; i <= r.i_1; i++)
		for(j = r.j_0; j <= r.j_1; j++)
		    if (gstate.cells.at(i, j) !== gamestate.cells.at(i,j))
			draw_cell_xy(ctx, cell_size, gamestate.cells.at(i,j), j_x(j), i_y(i))
	}
	gstate = gamestate.copy();
    }
    
    
    this.resize = function(coordinate_handler, new_gstate=gstate) {
	cell_size = coordinate_handler.cell_size;
	i_y = coordinate_handler.i_y;
	j_x = coordinate_handler.j_x;
	rectangle = coordinate_handler.rectangle;
	this.whipe();
	this.project(new_gstate);
    }
}
	
