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
