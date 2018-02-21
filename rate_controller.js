function RateController(n=1000, f=undefined) {
  // Executes the function f every n msecs. The rate can be changed (set_rate), the execution can
  // be turned on and off (toggle, on, off), and a new function can be set. If a new function is set
  // when the old function was executing, the new function will begin executing instead, and the old
  // function will stop executing
  this.handle = undefined;
  this.rate = n;
  this.f = f;
  this.set_f = (g) => this.f = g;
  this.set_rate = function(new_rate){
	this.rate = new_rate;
	//if it was on, update the execution rate
	if (this.is_on()){ 
		this.off();
		this.on();
	}
  }		
  this.on = function () {
    window.clearInterval(this.handle); 
    this.handle = window.setInterval(() => this.f(), this.rate);
  };
  this.off = function () {window.clearInterval(this.handle); this.handle = undefined;};
  this.toggle = () => this.handle === undefined ? this.on() : this.off();
  this.is_on = () => this.handle !== undefined;
}

