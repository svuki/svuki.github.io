function newEmptyGOLfromCanvas(canvas, rule=classic_rule) {
    //currently defaults to minimum pixel size of 5
    const rows = Math.floor(canvas.height / 5);
    const cols = Math.floor(canvas.width / 5);
    return new Game_of_life(newEmptyGameState(rows,cols), rule);
}


function Presenter(canvas, gol=newEmptyGOLfromCanvas(canvas), cell_size=10) {
    this.gol = gol;
    this.cell_size = cell_size;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    //logical_zero is the uppermost, leftmost cell that is shown on the canvas
    //the uppermost, leftermost point of this cell is not necessarily at (0,0) on
    //the canvas, however
    let rect = calculate_rectangle(canvas, this.gol.current_state, this.cell_size);
    this.logical_offset = [rect.i_offset, rect.j_offset];
    this.logical_zero = [rect.i_0, rect.j_0];
    

    this.update = () => project_game_state(this.canvas, this.gol.current_state, this.cell_size);

    this.canv_to_logical = function(x, y) {
	//converts x,y of the canvas coordiantes to i,j coordinates of the cells

	const x_scaled = (x - this.logical_offset[1]) / this.cell_size;
	const y_scaled = (y - this.logical_offset[0]) / this.cell_size;

	return [Math.floor(y_scaled + this.logical_zero[0]),
		Math.floor(x_scaled + this.logical_zero[1])];
    }

    this.click_cell = function(x,y) {
	let logical_cords = this.canv_to_logical(x, y);
	this.toggle(logical_cords[0], logical_cords[1]);
    }
    
    this.step = function() {
	this.gol.step();
	this.update();
    }

    this.toggle = function(i, j) {
	this.gol.toggle(i, j);
	this.update();
    }
    this.merge = function(g_state, x=0, y=0) {
	let logical_coords = this.canv_to_logical(x, y);
	this.gol.current_state.merge(g_state, logical_coords[0], logical_coords[1]);
	this.update();
    }
    this.soup = function() {
	this.gol.current_state.soup();
	this.update();
    }
    this.wipe = function() {
	this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    this.reset = function() {
	this.gol.current_state.clear();
	this.update();
    }
    this.resize = function(new_cell_size) {
	if (0 >= new_cell_size) 
	    throw "Error: Presenter.resize() passed negative new cell_size"

	this.cell_size = new_cell_size;
	let new_rect = calculate_rectangle(canvas, this.gol.current_state, new_cell_size);
	this.logical_offset = [new_rect.i_offset, new_rect.j_offset];
	this.logical_zero = [new_rect.i_0, new_rect.j_0];
	this.wipe();
	this.update();
    }
}
	
	
