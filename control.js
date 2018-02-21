//buttons and sliders
$("#toggle_grid_btn").click( () => toggle_grid() );
$("#soup_btn").click( () => set_gamestate(state.gamestate.soup()) );
$("#zoom-slider").on( 'input', function() { set_cell_size(this.value) });
$("#reset_btn").click( () => set_gamestate(state.gamestate.clear()) );
$("#toggle_step_btn").click( () => toggle_step() );
$("#rate_slider").on( 'input',
		      function() {
			  set_rate(this.value)});


const rle_textarea = $("#rle_textarea");

$("#rle_submit_btn").click( function() {
    const rle_text = rle_textarea.val();
    const result = rle.decode(rle_text);
    set_pattern(result.gamestate);
});
$("#rle_generate_btn").click( function() {
    const rle_str = rle.encode(state.gamestate, state.rule);
    rle_textarea.val(rle_str);
});

$("#save_btn").click( function() {
    add_to_save_list(snapshot());
});
    
