//functions to draw and toggle a grid overlay

function drawGrid(canvas, cell_size=10) {
   let range = (x) => Array.from({length: x}, (v, i) => i);
   let width = canvas.width;
   let height = canvas.height;
   let ctx = canvas.getContext('2d');
   let draw_horiz = (n) => {
	//draw the n_th horizontal line
	ctx.beginPath();
	ctx.moveTo(0, n * cell_size);
	ctx.lineTo(width, n * cell_size);
	ctx.stroke();
   }
   let draw_vertical = (n) => {
	//draw the n_th vertical line
	ctx.beginPath();
	ctx.moveTo(n * cell_size, 0);
	ctx.lineTo(n * cell_size, height);
	ctx.stroke();
   }

   range(Math.floor(height / cell_size)).forEach( draw_horiz );
   range(Math.floor(width / cell_size)).forEach( draw_vertical );
}

function clearGrid(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
}

function Grid(canvas, cell_size=10) {
    let state = 0;

    this.on = () => {
	drawGrid(canvas, cell_size);
	state = 1;
    }

    this.off = () => {
	clearGrid(canvas);
        state = 0;
    }

    this.toggle = () => {
        if (state === 0) {
            this.on();
         }
         else {
            this.off();
         }
    }
}
