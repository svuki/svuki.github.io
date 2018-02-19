function Canvas_set(canvas_id, cell_size=10) {
    this.under_canvas = $(canvas_id).get(0);

    if (this.under_canvas === undefined)
	throw ("Error: Canvas_set passed invalid canvas-id: " + canvas_id);

    //create and initialize the over canvas 
    let o_canvas = document.createElement('canvas');
    o_canvas.height = this.under_canvas.height;
    o_canvas.width = this.under_canvas.width;
    $(o_canvas).css('position', 'absolute');
    $(o_canvas).css('top', $(canvas_id).css('top'));
    $(o_canvas).css('left', $(canvas_id).css('left'));
    $(o_canvas).css('z-index', 1 + parseInt($(canvas_id).css('z-index')));
    this.under_canvas.after(o_canvas);
    this.over_canvas = o_canvas;
   
    this.set_gamestate = undefined;
    this.get_gamestate = undefined;
    this.projector = new Projector(this.under_canvas);
    this.grid = new Grid(this.over_canvas, cell_size);
    this.coordinate_handler = undefined; //set in initialize()
    
    this.initialize = function(gamestate, cell_size, getter, setter) {
	this.set_gamestate = setter;
	this.get_gamestate = getter;
	this.coordinate_handler = new Coordinate_handler(this.under_canvas,
							 gamestate, cell_size);
	this.projector.initialize(gamestate, this.coordinate_handler);
	
    }

    this.change_gamestate = function(gamestate, cell_size){
	// used when one wants to display a gamestate of different dimensions than the previous one
	this.coordinate_handler = new Coordinate_handler(this.under_canvas,
							 gamestate, cell_size);
	this.projector.resize(this.coordinate_handler, gamestate);
    }
    
    this.toggle = function(x,y) {
	let i = this.coordinate_handler.y_i(y);
	let j = this.coordinate_handler.x_j(x);
	let a = this.get_gamestate().toggle(i,j);
	console.log(a);
	this.set_gamestate(a);
    }

    //By default, clicking toggles the underlying cell
    $(this.over_canvas).click( (e) => this.toggle(e.offsetX, e.offsetY));

    this.merge = function(otherGameState, x, y) {
	let i = this.coordinate_handler.y_i(y);
	let j = this.coordinate_handler.x_j(x);

	this.set_gamestate(this.get_gamestate().merge(otherGameState, i, j));
    }

    this.project = function() {
	this.projector.project(this.get_gamestate());
    }
    this.toggle_grid = function() {
	this.grid.toggle();
    }
}



    
