var Module = Class.extend({
	init: function () {
		this.deActivate(); 
	},
	enable: function () {
		this.enabled = true; 
	},
	disable: function () {
		this.enaled = false; 
	}
})