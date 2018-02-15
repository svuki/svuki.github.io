// This files contains functions related to the construction and manipulation
// of two dimensional arrays (TDArray)


function TDArray (rows, cols=rows, init_fn=undefined, wrap=true) { 
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
    var r = wrap ? (i) => (i + rows) % rows
                    : (i) => i;
    var c = wrap ? (j) => (j + cols) % cols
                    : (j) => j;
    this.rows = rows;
    this.cols = cols;	
    this.show = () => console.log(arr);
    this.at  = (i, j) => arr[r(i)][c(j)];
    this.set = (i, j, val) => arr[r(i)][c(j)] = val;
    this.sum = () => arr.reduce( (a, n) => a + arr_sum(n), 0);
    this.map = function (f) {
        return new TDArray(rows, 
                           cols, 
                           (i, j) => f(this.at(i,j), i, j, this), 
                           wrap);
    };
    this.for_each = (f) => {
	    for (i = 0; i < this.rows; i++) {
		    for (j = 0; j < this.cols; j++) {
		    	f(arr[i][j], i, j);
		    }
	    }
    }	
    this.rect = (i0, j0, i1, j1) => {
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
                          wrap);
        }
    }

    this.row = (i) => arr[r(i)];
    this.col = (j) => arr.map( (a) => a[c(j)] );
    this.nbhood = function (i, j, row_d, col_d=row_d) {
        const i_min = i - row_d;
        const i_max = i + row_d;
        const j_min = j - col_d;
        const j_max = j + col_d;
        return this.rect(i_min, j_min, i_max, j_max);
    }

    this.merge = (tdarr, i=0, j=0) => {	
	//copy in elements of tdarr such that tdarr[0][0] is 
	//at this TDArray's [i][j] position.
	    const row_indices = range(i, i + tdarr.rows);
	    const col_indices = range(j, j + tdarr.cols);
        row_indices.forEach( (x, i) =>
            col_indices.forEach( (y, j) =>
                this.set(x, y, tdarr.at(i, j))));
    };
    this.copy = () => this.map ( (x) => x);	
    this.as_array = () => arr.reduce( (acc, orig) => acc.concat(orig), [] );
    this.row_map = (f) => arr.map( f );
    this.transpose = () => new TDArray(this.cols, this.rows, (i, j) => this.at(j, i));
}




















