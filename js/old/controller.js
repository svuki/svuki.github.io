const gof_canvas = document.getElementById('gof-canvas');
const grid_canvas = document.getElementById('grid-canvas');
const rate_slider = document.getElementById('rate-slider');

const control = {
    grid_canvas : grid_canvas,
    gof_canvas : gof_canvas,
    grid : new Grid(grid_canvas),
    current_gof : new Decorated_gof(gof_canvas),
    r_control : new RateController(1000, 
                                   function() {control.current_gof.next();}),
    saves   : [],
    button0 : () => toggle_gof_on(),
    button1 : () => reset_gof(),
    button2 : () => toggle_grid(),
    button3 : () => save(),
    button4 : function() {
	this.current_gof.soup();
    },
};



function toggle_gof_on() {control.r_control.toggle()};
function reset_gof() {control.current_gof.clear()};
function toggle_grid() {control.grid.toggle()};

rate_slider.onchange = function() {control.r_control.set_rate(this.value)}
    
