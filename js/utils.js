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

