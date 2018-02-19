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
	thumbnail.addEventListener('click', () => restore(val));
	save_counter++;
}

function gof_thumbnail(gof) {
    //produce a thumbnail versiion of the TDArray on the canvas
    const tdarr = gof.cells;
    const canvas = document.createElement('canvas');
    canvas.height = tdarr.rows;
    canvas.width  = tdarr.cols;
    const ctx = canvsas.getContext('2d');
    
    tdarr.for_each( (v, i, j) => 
       ctx.data[(i * tdarr.rows) + j)] = (v === 1 ? (255, 255, 255), (0,0,0))];)
    
    return canvas;
}
    

    
