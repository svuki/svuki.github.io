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



    
//buttons and sliders
$("#toggle_grid_btn").click( () => toggle_grid() );
$("#soup_btn").click( () => set_gamestate(state.gamestate.soup()) );
$("#zoom-slider").on( 'input', function() { set_cell_size(this.value) });
$("#reset_btn").click( () => set_gamestate(state.gamestate.clear()) );
$("#toggle_step_btn").click( () => toggle_step() );
$("#rate_slider").on( 'input',
		      function() {
			  set_rate(this.value)});


const rle_textarea = $("#rle_textarea");

$("#rle_submit_btn").click( function() {
    const rle_text = rle_textarea.val();
    const result = rle.decode(rle_text);
    set_pattern(result.gamestate);
});
$("#rle_generate_btn").click( function() {
    const rle_str = rle.encode(state.gamestate, state.rule);
    rle_textarea.val(rle_str);
});

$("#save_btn").click( function() {
    add_to_save_list(snapshot());
});
    
function Game_of_life(initial_state, rule=classic_rule) {
    this.current_state = initial_state;
    this.past = [];
    this.rule = rule;
    this.step = function() {
	this.past.push(this.current_state);
	this.current_state = apply_rule(rule, this.current_state);
    }
    this.snapshot = () =>
	({state : this.current_state,
	 rule  : this.rule});
}
    
// This file defines Gof and Decorate_gof. A Gof (game of life) is a two 
// dimensional array, a rule, which defines the next generation of the array.
// A decorated_gof is is a gof associated with a canvas. Interactions through
// a decoared_gof update what is displayed on the canvas.


function GameState (cells_tdarr) {
	this.cells = cells_tdarr;
}

function GameStateFromCanvas(canvas, cell_size=1) {
    //Creates a new, empty gamestate with the maximum number of cells of size CELL_SIZE
    //that fit onto canvas.
    const rows = canvas.height / cell_size;
    const cols = canvas.width / cell_size;

    return newEmptyGameState(rows, cols);
}

function newEmptyGameState(rows, cols) {
    return new GameState(new TDArray(rows, cols, () => 0, false));
}

GameState.prototype.toggle = function(i,j) {
    const val = this.cells.at(i,j) === 0 ? 1 : 0;
    const new_cells = this.cells.copy();
    new_cells.set(i,j,val);
    return new GameState(new_cells);
}
GameState.prototype.clear = function () {
    return new GameState(this.cells.map( () => 0 ));
}
GameState.prototype.copy = function () {
    return new GameState(this.cells.copy())
}
GameState.prototype.soup = function () {
    //randomly fill the gameState with 1's and 0's
    return new GameState(this.cells.map( () => Math.random() > 0.5 ? 1 : 0));
}
GameState.prototype.merge = function(otherGameState, i=0, j=0) {
    //takes the cells of otherGameState and copies them in such that
    //cells[0][0] of otherGameState is at [i][j] in this game state
    let new_cells = this.cells.copy();
    new_cells.merge(otherGameState.cells, i, j);
    return new GameState(new_cells);
}
GameState.prototype.map = function (f) {
    return new GameState(this.cells.map(f));
}


function Rule(s) {
    const matches = s.match("[B,b](.*)/[S,s](.*$)")
    this.b = matches[1].split("").map( (v) => parseInt(v, 10) );
    this.s = matches[2].split("").map( (v) => parseInt(v, 10) );
    this.string = s
    
}
const classic_rule = new Rule("B3/S23");

function rule_fn(rule) {
    return (val, i, j, tdarr) => {
	let sum = tdarr.nbhood(i,j,1,1).sum() - val;
	if (val === 0 && rule.b.includes(sum))
	    return 1;
	else if (val === 1 && rule.s.includes(sum))
	    return 1;
	else
	    return 0;
    }
}

function apply_rule(rule, gstate) {
    return gstate.map(rule_fn(rule));
}
    

function draw_line(ctx, x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function draw_horizontal_lines(canvas, offset, spacing) {
    const ctx = canvas.getContext('2d');
    range(Math.ceil(canvas.height / spacing))
          .forEach((v) => 
              draw_line(ctx, 
                        0, offset + (v * spacing),
                        canvas.width, offset + (v * spacing)));
}

function draw_vertical_lines(canvas, offset, spacing) { 
	const ctx = canvas.getContext('2d');
	    range(Math.ceil(canvas.width / spacing))
	          .forEach((v) => 
	              draw_line(ctx, 
	                        offset + (v * spacing), 0,
	                        offset + (v * spacing), canvas.height));
}    


function Grid (canvas, csize=10) {
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 0.5;
    
    let on_b = false;
    this.cell_size = csize;
    this.project_grid = function() {
	const canv_rows = canvas.height / this.cell_size;
	const canv_cols = canvas.width / this.cell_size;
	
	const y_offset = ((canv_rows - Math.floor(canv_rows)) / 2) * this.cell_size;
	const x_offset = ((canv_cols - Math.floor(canv_cols)) / 2) * this.cell_size;
	ctx.lineWidth = 0.5;
	draw_horizontal_lines(canvas, y_offset, this.cell_size);
        draw_vertical_lines(canvas, x_offset, this.cell_size);
	on_b = true;
    }
    
    this.clear_grid = function() {
	ctx.clearRect(0,0, canvas.width, canvas.height);
	on_b = false;
    }
    
    this.toggle = () => {
	if (on_b) {
	    this.clear_grid();
	    on_b = false;
	}
	else {
	    this.project_grid();
	    on_b = true;
	}
    }
    this.redraw = () => {
	this.clear_grid();
	this.project_grid();
    }
    this.resize = (new_cell_size) => {
	if (new_cell_size <= 0)
	    throw "Grid.resize passed negative or 0 cell_size"
	this.cell_size = new_cell_size;
	if (on_b)
	    this.redraw();
    }
}
const patterns = {
    backrake_1 : "x = 27, y = 18, rule = B3/S23\n5b3o11b3o5b$4bo3bo9bo3bo4b$3b2o4bo7bo4b2o3b$2bobob2ob2o5b2ob2obobo2b$b\n2obo4bob2ob2obo4bob2ob$o4bo3bo2bobo2bo3bo4bo$12bobo12b$2o7b2obobob2o7b\n2o$12bobo12b$6b3o9b3o6b$6bo3bo9bo6b$6bobo4b3o11b$12bo2bo4b2o5b$15bo11b\n$11bo3bo11b$11bo3bo11b$15bo11b$12bobo!",

    pi_wave : "x = 45, y = 29, rule = B3/S23\n4bo17bo17bo$3bobo15bobo15bobo$3bobo15bobo15bobo$3bobo15bobo15bobo4$3bo\nbo15bobo15bobo2$2bo3bo13bo3bo13bo3bo$3b3o15b3o15b3o4$b2o3b2o11b2o3b2o\n11b2o3b2o$bo5bo11bo5bo11bo5bo$2b5o13b5o13b5o$2bobobo13bobobo13bobobo$b\no5bo11bo5bo11bo5bo$bob3obo11bob3obo11bob3obo$bo5bo11bo5bo11bo5bo$4bo\n17bo17bo$4bo17bo17bo$4bo17bo17bo4$o7bo9bo7bo9bo7bo$o7bo9bo7bo9bo7bo!",

    spaceship : "x = 35, y = 19, rule = b3/s23\n33bob$16bo15bobo$6bobo6bo5b2o8bo3b$6bo4bo4bob6o4b2o5b$6bob8o10bo2bob3o\nb$9bo5bo7b4o4b3ob$4b2o17b3obo7b$bo2b2o7b2o8b2o10b$bo2bo30b$o34b$bo2bo\n30b$bo2b2o7b2o8b2o10b$4b2o17b3obo7b$9bo5bo7b4o4b3ob$6bob8o10bo2bob3ob$\n6bo4bo4bob6o4b2o5b$6bobo6bo5b2o8bo3b$16bo15bobo$33bo!"
}
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
	
function RateController(n=1000, f=undefined) {
  // Executes the function f every n msecs. The rate can be changed (set_rate), the execution can
  // be turned on and off (toggle, on, off), and a new function can be set. If a new function is set
  // when the old function was executing, the new function will begin executing instead, and the old
  // function will stop executing
  this.handle = undefined;
  this.rate = n;
  this.f = f;
  this.set_f = (g) => this.f = g;
  this.set_rate = function(new_rate){
	this.rate = new_rate;
	//if it was on, update the execution rate
	if (this.is_on()){ 
		this.off();
		this.on();
	}
  }		
  this.on = function () {
    window.clearInterval(this.handle); 
    this.handle = window.setInterval(() => this.f(), this.rate);
  };
  this.off = function () {window.clearInterval(this.handle); this.handle = undefined;};
  this.toggle = () => this.handle === undefined ? this.on() : this.off();
  this.is_on = () => this.handle !== undefined;
}

const rle = (function() {
    function reduce_to_pattern(tdarr) {
	//returns only that portion of tdarr relevant to the contained pattern
	//TODO: when working with wrapped TDArrays, this will chop off possbily 
	//important empty rows right where the TDArray wraps around
	const is_one = (v) => v === 1;
	let i_0 = -1; //row of first non-zero entry with least i_index
	let j_0 = -1; //col of none-zero entry with least j_index
	let i_1 = -1; //row of last non-zero entry
	let j_1 = -1; //col of entry with greatest j_index
	for (r_index = 0; r_index < tdarr.rows; r_index++) {
            if (tdarr.row(r_index).some(is_one)) {
		i_0 = r_index;
		break;
            }
	}
	for (r_index = tdarr.rows - 1; r_index >= 0; r_index--) {
            if (tdarr.row(r_index).some(is_one)) {
		i_1 = r_index;
		break;
            }
	}
	for (c_index = 0; c_index < tdarr.cols; c_index++) {
            if (tdarr.col(c_index).some(is_one)) {
            j_0 = c_index;
		break;
            }
	}
	for (c_index = tdarr.cols - 1; c_index >= 0; c_index--) {
            if (tdarr.col(c_index).some(is_one)) {
		j_1 = c_index;
		break;
        }
	}
	return tdarr.rect(i_0, j_0, i_1, j_1);
    }
    
    function from_rle_group(s) {
	//produces an array of values from a RLE codon
	//for example "3o" => [1, 1, 1,]
	//for example "b" => [0]
	const enc_map = {'o' : 1, 'b' : 0};
	let matches = s.match(/(\d*)([a-z])/);
	let val = enc_map[matches[2]];
	let num_str = matches[1];
    
	if (num_str  === '') {
	    return [val];
	}
	else {
	    let num = parseInt(num_str);
	    return new Array(num).fill(val);
	}
    }
	
    
    function rle_to_row(rle) {
	//given a rle encoding a row, returns the row decoded
	if (rle === '' || rle === '!')
	    return [];
	const regex = new RegExp(/(\d*[a-z])/, 'g');
	let groups = rle.match(regex);
	return flatmap(groups, from_rle_group);
    }
    
    function expand_rle(rle) {
	//replaces empty line encodings with a run of $'s
	//for example "2b3$o!" => "2b$$$o!"
	const regex = new RegExp(/(\d+)\$/, 'g');
	return rle.replace(regex, (m, p) => '$'.repeat(parseInt(p)));
    }
    
    function tdarr_from_rle(rle, row_len, pad_value=0) {
    //given a rle encoding a pattern and the row length of the pattern
	//returns a TDArray holding the pattern.
	
	//handle empty lines
	const rle_expanded = expand_rle(rle);
	const line_regex = new RegExp(/\w*(\$|\!)/, 'g');
	const rle_rows = rle_expanded.match(line_regex);
	const vals = rle_rows.map( rle_to_row );
	const full_rows = vals.map( (arr) => pad(arr, 0, row_len));
	return new TDArray(vals.length, row_len, (i,j) => full_rows[i][j]);
    }
    
    //rle headers are of the form "x = 12, y = 3, rule = B3/S23" with possible variable spacing
    function rle_header_rows(rle_header) {
	//extracts the numbers of rows (y value) from a rle header
	let regex = new RegExp(/y\s*=\s*(\d*)/);
	return parseInt(rle_header.match(regex)[1]);
    }
    
    function rle_header_cols(rle_header) {
	let regex = new RegExp(/x\s*=\s*(\d*)/);
	return parseInt(rle_header.match(regex)[1]);
    }

    function rle_header_rule(rle_header) {
	let regex = new RegExp(/[B,b]\d*\/[S,s]\d*/);
	let match = rle_header.match(regex);
	return new Rule(match[0]);
    }

    function from_rle(rle) {
	//returns an object of the form {rule : RULE, pattern :TDArray) from a rle
	//encoding a pattern. Ignores any comments lines
	let lines = rle.split('\n');
	lines = lines.filter( (l) => ! (l.match('^#')) );
	const header = lines[0];
	const rows = rle_header_rows(header);
	const cols = rle_header_cols(header);
	const rule = rle_header_rule(header);
	const tdarr = tdarr_from_rle(lines.slice(1).join(''), cols, 0);
	return {rule : rule, gamestate: new GameState(tdarr)};
    }
    
    
    function row_to_rle(row) {
	const unencoded = row.map( (v) => v === 0 ? 'b' : 'o' ).join('');
	const regex = new RegExp(/(.)\1+/, 'g');
	let encoded = unencoded.replace(regex, (m, p) =>
					String(m.length) + p);
	//remove any trailing 'b's and place '$' at the end of the string
	let ret = encoded.replace(/\d*b*$/, () => '$');
	return ret;
    }

    function to_rle(tdarr, rule) {
	const header = ['x=', tdarr.cols, ', y=', tdarr.rows, ", rule = ", rule.string].join('');
	let pattern_rle =  tdarr.row_map( row_to_rle ).join('');
	//the pattern should end in !, the last $ isn't needed
	pattern_rle = pattern_rle.replace(/\$$/, '!');
	//group together runs of $
	let multi_endline_rg = new RegExp(/\$+/, 'g');
	pattern_rle = pattern_rle.replace(multi_endline_rg, (m) => String(m.length) + "$");
	//line lengths should be at most 70 characters
	const lines = [header].concat(chunk(pattern_rle, 70));
	return lines.join('\n');
    }

    return {
	encode : function(gamestate, rule=classic_rule, compress_b=true) {
            if (compress_b)
		return to_rle(reduce_to_pattern(gamestate.cells), rule);
            else
		return to_rle(gamestate.cells, rule);
	},    
	decode : (r) => from_rle(r)
    }
}());
   
function saveListElem (upper, lower) {    
    $(upper).on('click', function(e) {
	if (e.target === this)
	    $(lower).slideToggle();
    });
	       
    $(lower).on('click', function() {
	if (e.target === this)
	    $(lower).slideToggle()
    });
	       
    const elem = document.createElement("li");
    $(elem).append(upper);
    $(elem).append(lower);
    return elem;
}

function gamestateThumbnail(gamestate) {
    const height = gamestate.cells.rows;
    const width = gamestate.cells.cols;

    let canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;

    const coord_handler = new Coordinate_handler(canvas, gamestate, 1);
    const projector = new Projector(canvas);
    projector.initialize(gamestate, coord_handler);
    projector.project(gamestate);
    $(canvas).addClass( "save_thumbail" );

    return canvas;
}

function buttonSet(snapshot) {
    let elem =  document.createElement("span");

    let restore_btn = document.createElement("button");
    $(restore_btn).addClass("save_list_btn");
    restore_btn.innerHTML = "LD";
    $(restore_btn).click( function() {
	load_snapshot(snapshot);
    });

    //TODO: add rle slot to state object to avoid reading/writing to the box here
    let rle_btn = document.createElement("button");
    $(rle_btn).addClass("save_list_btn");
    rle_btn.innerHTML = "RLE";
    $(rle_btn).click( function() {
	const rle_str = rle.encode(state.gamestate, state.rule);
	rle_textarea.val(rle_str);
    });
		    
    $(elem).append(rle_btn);
    $(elem).append(restore_btn);

    return elem;
}
    
   
function processSnapshot(snapshot, save_id) {
    const gstate = snapshot.gamestate;
    const rule_str = snapshot.rule.string;

    let upper = document.createElement("li");
    upper.innerHTML = save_id + " Rule: " + rule_str;
    $(upper).addClass("save_list_upper");
    $(upper).append(buttonSet(snapshot));

    let lower = document.createElement("li");
    $(lower).append(gamestateThumbnail(gstate));
    $(lower).addClass("save_list_lower");

    return saveListElem(upper, lower);
}

const generateSaveId = (function() {
    let counter = 0;
    
    return function() {
	const saveId= "Save #" + String(counter);
	counter++;
	return saveId;
    }
})();

const saveListId = "#save-list"
function addToSaveList(snapshot) {
    $(saveListId).append(processSnapshot(snapshot, generateSaveId()));
    return true;
}
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
    save_list : [],
    
    observers : {
	rate : [],
	step_on : [],
	grid_on : [],
	cell_size : [],
	pattern : [],
	gamestate : [],
	rule : [],
	save_list : []
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
	if (! (property in this.observers))
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

function snapshot() {
    return {
	gamestate : state.gamestate,
	rule : state.rule,
    };
}
function add_to_save_list(x) {
    state.save_list.push(x);
    state.notify("save_list");
}

function load_snapshot(snapshot) {
    set_gamestate(snapshot.gamestate);
    set_rule(snapshot.rule);
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

//Update the save_list by displaying the relevant snapshot
const save_list = {
    update : function (property) {
	switch (property) {
	case 'save_list':
	    addToSaveList(state.save_list[state.save_list.length - 1]);
	    break;
	}
    }
}
state.add_observer("save_list", save_list);
// This files contains functions related to the construction and manipulation
// of two dimensional arrays (TDArray)


function TDArray (rows, cols=rows, init_fn=undefined, wrap_b=false) { 
    // Constructor for two dimensional arrays. 
    // init_fn is a function that is passed (row_index, col_index)
    // If no init_fn is specified, all elements are initialized to 0.
    // The boolean wrap determines whethers the rows and cols 'wrap' 
    // around: if wrap is true, then at(i, j) == at(i mod rows, j mod cols).

    var arr = [];
    for (i = 0; i < rows; i++){
	    arr.push(new Array(cols).fill(0));  
    }
  
    if (init_fn) {
        arr = mapmap(arr, (v, i, j) => init_fn(i, j));
    }
  
    // TODO: r and c only work if i > -rows and j > -cols
    // because x % n <= 0 if x <= 0 for any n
    var r = wrap_b ? (i) => (i + rows) % rows
        : (i) => i;
    var c = wrap_b ? (j) => (j + cols) % cols
        : (j) => j;
    this.wrap = wrap_b;
    this.rows = rows;
    this.cols = cols;	
    this.show = () => console.log(arr);
    this.at  = function(i, j) {
	if (wrap_b)
	    return arr[r(i)][c(j)];
	//otherwise check bounds, returning zero if out of bounds
	else if (i < 0 || i >= this.rows || j < 0 || j >= this.cols)
	    return 0;
	else
	    return arr[i][j];
    }
	    
    this.set = (i, j, val) => arr[r(i)][c(j)] = val;
    this.sum = () => arr.reduce( (a, n) => a + arr_sum(n), 0);
    this.row = (i) => arr[r(i)];
    this.col = (j) => arr.map( (a) => a[c(j)] );	
    this.as_array = () => arr.reduce( (acc, orig) => acc.concat(orig), [] );
    this.row_map = (f) => arr.map( f );
    
}

TDArray.prototype.map = function (f) {
    return new TDArray(this.rows, 
                       this.cols, 
                       (i, j) => f(this.at(i,j), i, j, this), 
                       this.wrap);
};

TDArray.prototype.copy = function() {
    return this.map ( (x) => x);
}

TDArray.prototype.for_each = function(f) {
    for (i = 0; i < this.rows; i++) {
	for (j = 0; j < this.cols; j++) {
	    f(this.at(i,j), i, j);
	}
    }
};

TDArray.prototype.rect = function(i0, j0, i1, j1) {
    //normalize input order so that i0 <= i1 and j0 <= j1
    if (i1 < i0) {
        return this.rect(i1, j0, i0, j1);
    }
    else if (j1 < j0) {
        return this.rect(i0, j1, i1, j0);
    }
    //returns the submatrix of entries (i, j) such that 
    //i0 <= i <= i1 and j0 <= j <= j1
    else {
	let row_indices = range(i0, i1 + 1);
    	let col_indices = range(j0, j1 + 1);
	
        let rect_arr = row_indices.map( (i) => 
					col_indices.map ( (j) => 
							  this.at(i,j) ) );
	
	return new TDArray(i1 - i0 + 1, j1 - j0 + 1,
                           (i, j) => rect_arr[i][j],
			   this.wrap);
    }
};

TDArray.prototype.nbhood = function (i, j, row_d, col_d=row_d) {
    const i_min = i - row_d;
    const i_max = i + row_d;
    const j_min = j - col_d;
    const j_max = j + col_d;
    return this.rect(i_min, j_min, i_max, j_max);
};

TDArray.prototype.merge = function(tdarr, i=0, j=0) {	
    //copy in elements of tdarr such that tdarr[0][0] is 
    //at this TDArray's [i][j] position.
    const row_indices = range(i, i + tdarr.rows);
    const col_indices = range(j, j + tdarr.cols);
    row_indices.forEach( (x, i) =>
			 col_indices.forEach( (y, j) =>
					      this.set(x, y, tdarr.at(i, j))));
};

TDArray.prototype.transpose = function() {
    return new TDArray(this.cols, this.rows, (i, j) => this.at(j, i));
}

function chunk(str, n) {
	let ret = [];
    let slice_index = 0;
    while(slice_index + n <= str.length) {
        ret.push(str.slice(slice_index, slice_index + n));
        slice_index += n;
    }
    if (slice_index != str.length)
        ret.push(str.slice(slice_index, str.length))
    return ret;
}

function flatten(arr) {
    return arr.reduce( (a, n) => a.concat(n), []);
}


function pad(arr, val, n) {
    //returns a new array of length n that agrees with arr on
    // 0 ... arr.length - 1 and has value val in indices arr.length ...  n
	let count = n - arr.length;
	let pad_arr = Array.from({length : count}).fill(val);
	return arr.concat(pad_arr);
}

function flatmap(arr, f) {
    return arr.reduce( (a, n) => a.concat(f(n)), []);
}
function mapmap (arr, f) {
    //applies f to each element of f, producing
    //a new 2D array. The arguments passed to f are
    // (val, row_index, col_index, arr)
    return arr.map( (arr, r) =>
		    (arr.map( (val, c) =>
			      f(val, r, c, arr))));
}

function arr_sum (arr) {
    ///returns the sum of the elements of arr
    return arr.reduce( (a, n) => a + n);
}

function range (x, y) {
    //if only passed one value, returns the [0, 1, ..., x - 1]
    //if passed two values returns [x, x + 1, ..., y]
    if (y) {
        return Array.from({length : y - x}, (v, i) => i + x);
    }
    else {
        return Array.from({length : x}, (v, i) => i);
    }
}

