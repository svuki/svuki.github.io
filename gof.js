// This file defines Gof and Decorate_gof. A Gof (game of life) is a two 
// dimensional array, a rule, which defines the next generation of the array.
// A decorated_gof is is a gof associated with a canvas. Interactions through
// a decoared_gof update what is displayed on the canvas.


function Gof(rows, cols, rule=classic_rule, cells=(new TDArray(rows, cols))) {
	this.generation = 0;
	this.rule = rule;
	this.cells = cells;
	this.next  = function () { 
	    this.cells = this.cells.map(rule.as_fn);
	    this.generation++;
	};
	//TODO: what to do for toggle of more than one possible val?
	this.toggle = (i, j) => {
		var val = this.cells.at(i,j) ? 0 : 1
		this.cells.set(i,j,val);
		return val;
	};
	this.clear = () => {
		this.cells = this.cells.map( () => 0 );
		this.generate = 0;
	};	
    this.copy = function() {
        let ret = new Gof(cols, rows, this.rule);
        ret.generation = this.generation; 
        ret.cells = this.cells.copy();
        return ret;
    }
    this.soup = function() {
        this.cells = this.cells.map( () => Math.random() > 0.5? 1 : 0 );
    }                
} 

function Rule(s) {
    const matches = s.match("[B,b](.*)/[S,s](.*$)")
    this.b = matches[1].split("").map( (v) => parseInt(v, 10) );
    this.s = matches[2].split("").map( (v) => parseInt(v, 10) );
    this.string = s
    this.as_fn  = (val, i, j, tdarr) => {
	let sum = tdarr.nbhood(i,j,1,1).sum() - val;
	if (val === 0 && this.b.includes(sum))
	    return 1;
	else if (val === 1 && this.s.includes(sum))
	    return 1;
	else
	    return 0;
    }
}

const classic_rule = new Rule("B3/S23");





