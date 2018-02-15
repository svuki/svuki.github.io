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
    
//Handle toggling pixels by clicking and copying regions by dragging
function toggler(decorate_gof){ 
    let down_event = undefined;

    return function(e) {
        if (e.type === "mousedown") {
            if (e.shiftKey) {
                control.current_gof.handle_merge(e.offsetX, e.offsetY);
            }
            else {
                down_event = [e.offsetX, e.offsetY];
            }
        }
        else if (e.type === "mouseup" 
                 && down_event !== undefined
                 && e.shiftKey === false) {
            decorate_gof.handle(down_event, [e.offsetX, e.offsetY]);
        }
    }
}

const mouse_click_handler = toggler(control.current_gof);

grid_canvas.addEventListener('mousedown', 
            (e) => mouse_click_handler(e));
grid_canvas.addEventListener('mouseup', 
            (e) => mouse_click_handler(e));


//Saving and resotoring
const save_list = document.getElementById('save-list');
let save_counter = 0;

function restore(n) {
    let gof = control.saves[n];
    control.current_gof.load_gof(gof);
}


function save() {
    const gof = control.current_gof.save_gof();
	control.saves.push(gof);
    const thumbnail = gof_thumbnail(gof);
	save_list.appendChild(thumbnail);
    let val = save_counter;
	thumbnail.addEventListener('click', () => {console.log('clicked');restore(val)});
	save_counter++;
}

function flat_map(arr, fn) {
    let x = arr.map( fn );
    return x.reduce ( (a, n) => a.concat(n), []);
}

function val_to_RGBA(val) {
    return val === 1 ? [0,0,0,255] : [255, 255, 255, 255];
}

function tdarr_to_rgba(tdarr) {
    return flat_map(tdarr.as_array(), val_to_RGBA );
}

function tdarr_to_image_data(tdarr, image_data) {
    let c      = tdarr_to_rgba(tdarr);
    c.forEach( (v, i) => image_data.data[i] = v );
 
}
    
function gof_thumbnail(gof) {
    //produce a thumbnail versiion of the TDArray on the canvas
    const tdarr = gof.cells;
    const canvas = document.createElement('canvas');
    canvas.width = tdarr.cols;
    canvas.height  = tdarr.rows;
    canvas.class  = "saved-gof";
    console.log("ok, canvas created")
    const ctx = canvas.getContext('2d');
    let img_data = ctx.createImageData(tdarr.cols, tdarr.rows);
    tdarr_to_image_data(tdarr, img_data);
    
    ctx.putImageData(img_data, 0, 0);
    console.log("ok, placed image data");
    
    return canvas;
}
    
//Handling RLE encoding/decoding
const rle_text = document.getElementById("rle-textarea")
function get_pattern() {
	const rle_str = rle_text.value;
	const pattern = rle.decode(rle_str);
	control.current_gof.saved_pattern = pattern.pattern;
}

function generate_rle() {
	const tdarr = control.current_gof.gof().cells;
	const rule = control.current_gof.gof().rule;
	rle_text.value = rle.encode(tdarr, rule);
}


