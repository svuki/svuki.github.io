function Game_of_life(initial_state, rule=classic_rule) {
    this.current_state = initial_state;
    this.past = [];
    this.rule = rule;
    this.step = function() {
	this.past.push(this.current_state);
	this.current_state = apply_rule(rule, this.current_state);
    }
    this.snapshot = () =>
	{state : this.current_state,
	 rule  : this.rule}
}
    
