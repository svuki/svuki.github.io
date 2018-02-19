const state = {
    rate : 1000,
    step_on: false,
    grid_on: false,
    cell_size : 10,
    //if you change this, look to change the initialization of the pattern canvas as well
    //currently the pattern canvas is initialized witha cell_size of 10 which might be too small
    pattern : newEmptyGameState(30, 30), 
    gamestate : undefined,
    rule : undefined,
    
    observers : {
	rate : [],
	step_on : [],
	grid_on : [],
	cell_size : [],
	pattern : [],
	gamestate : [],
	rule : []
    },
    
    add_observer : function(property, obj) {
	//Property is a string corresponding to one of the elements of state.observers,
	//obj is the object subscribing to updates
	if (! this.observers.hasOwnProperty(property))
	    console.log("Error, attempted to add observer to state for nonexistent property: " + property);
	else
	    this.observers[property].push(obj);
    },
    notify : function(property) {
	//Property is a string corresponding to one of the elements of state.observers
	if (! property in this.observers)
	    console.log("Error, state attempted to notify on nonexistent property: " + property);
	else
	    this.observers[property].forEach( (it) => it.update(property) );
    }
	
}


function set_rate(new_rate) {
    state.rate = new_rate;
    state.notify( "rate" );
}

function toggle_step() {
    state.step_on = state.step_on ? false : true;
    state.notify("step_on");
}

function toggle_grid() {
    state.grid_on = state.grid_on ? false : true;
    state.notify("grid_on");
}

function set_cell_size(new_size) {
    state.cell_size = new_size;
    state.notify("cell_size");
}

function set_gamestate(new_state) {
    state.gamestate = new_state;
    state.notify("gamestate");
}

function get_gamestate() {
    return state.gamestate;
}

function set_rule(new_rule) {
    state.rule = new_rule;
    state.notify("rule");
}

function set_pattern(new_gamestate) {
    state.pattern = new_gamestate;
    state.notify("pattern");
}
function get_pattern() {
    return state.pattern;
}

///
const gol_canvas_id = "#gol-canvas";
///Get Canvases
const gol_canvas = $(gol_canvas_id).get(0);

//Set initial game state: the maximum zoom size is 5
state.gamestate = GameStateFromCanvas(gol_canvas, 5);

//By default, the rule is B3/S23
state.rule = classic_rule;

//Create and Initialize main canvas set
const main_c_set = new Canvas_set("#gol-canvas", 10);
main_c_set.initialize(state.gamestate, 10, get_gamestate, set_gamestate);

state.add_observer('gamestate', main_c_set);
state.add_observer('grid_on', main_c_set);
state.add_observer('cell_size', main_c_set);

//Default behavior for clicks is to toggle the underlying cell.
//We override it here so that shift-clicking will copy in the currently saved pattern
$(main_c_set.over_canvas).unbind('click');
$(main_c_set.over_canvas).click( function(e) {
    if (e.shiftKey)  
	main_c_set.merge(state.pattern, e.offsetX, e.offsetY);
    else
	main_c_set.toggle(e.offsetX, e.offsetY);
});

	
main_c_set.update = function(property) {
    switch(property) {
    case 'gamestate':
	this.project();
	break;
    case 'grid_on':
	this.toggle_grid();
	break;
    case 'cell_size':
	this.coordinate_handler.resize(state.cell_size);
	this.projector.resize(this.coordinate_handler);
	this.grid.resize(state.cell_size);
	break;
    }
}




///Create the stepper which controls the rate the game of life evolves at
const stepper = new RateController(state.rate, () =>
				   set_gamestate(apply_rule(state.rule, state.gamestate)));
state.add_observer('rate', stepper);
state.add_observer('step_on', stepper);
stepper.update = function(property) {
    switch (property) {
    case 'rate':
	this.set_rate(state.rate);
	break;
    case 'step_on':
	this.toggle();
	break;
    }
}

///Create canvas set for the pattern canvas
const pattern_canvas_id = "#pattern_canvas";
const pattern_c_set = new Canvas_set(pattern_canvas_id, 10); //hardcoded 10
pattern_c_set.initialize(state.pattern, 10, get_pattern, set_pattern);
pattern_c_set.toggle_grid();

state.add_observer('pattern', pattern_c_set);

pattern_c_set.update = function(property) {
    switch (property) {
    case 'pattern':
	const csize = auto_cell_size(pattern_c_set.under_canvas, state.pattern);
	this.change_gamestate(get_pattern(), csize);
	this.grid.resize(csize);
	break;
    }
}



//For the time being, initialize the pattern canvas and the RLE text area w/ a backrake
$("#rle_textarea").val(patterns.backrake_1);
set_pattern(rle.decode(patterns.backrake_1).gamestate);
