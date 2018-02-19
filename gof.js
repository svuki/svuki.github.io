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
    

