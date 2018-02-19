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
