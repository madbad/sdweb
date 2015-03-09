var InputModule  =  Module.extend({
	init: function (game) {
		"use strict";
		//start watching the events
		document.addEventListener('keydown', this.onPress.bind(this));
		document.addEventListener('keyup', this.onRelease.bind(this));
		this.game = game;
		//
		this.keysState = [];
		
		var key = function (name){
			this.name = name;
			this.pressed = false;
			this.firstTime = false;
			this.wasPressed = this.pressed;
			this.statusHasChanged = function (){
				if(this.wasPressed != this.pressed){
					this.wasPressed=this.pressed;
					return true;				
				}else{
					this.wasPressed=this.pressed;
					return false;				
				}
			}
			return this;
		}
		
		//definisco i tasti
		this.keys = [];
			this.keys[8] = new key('backspace');
			this.keys[9] = new key('tab');
			this.keys[13] = new key('enter');
			this.keys[16] = new key('shift');
			this.keys[17] = new key('ctrl');
			this.keys[18] = new key('alt');
			this.keys[19] = new key('pause/break');
			this.keys[20] = new key('caps lock');
			this.keys[27] = new key('escape');
			this.keys[32] = new key('space');
			this.keys[33] = new key('page up');
			this.keys[34] = new key('page down');
			this.keys[35] = new key('end');
			this.keys[36] = new key('home');
			this.keys[37] = new key('leftArrow');
			this.keys[38] = new key('upArrow');
			this.keys[39] = new key('rightArrow');
			this.keys[40] = new key('downArrow');
			this.keys[45] = new key('insert');
			this.keys[46] = new key('delete');
			this.keys[48] = new key('0');
			this.keys[49] = new key('1');
			this.keys[50] = new key('2');
			this.keys[51] = new key('3');
			this.keys[52] = new key('4');
			this.keys[53] = new key('5');
			this.keys[54] = new key('6');
			this.keys[55] = new key('7');
			this.keys[56] = new key('8');
			this.keys[57] = new key('9');
			this.keys[65] = new key('a');
			this.keys[66] = new key('b');
			this.keys[67] = new key('c');
			this.keys[68] = new key('d');
			this.keys[69] = new key('e');
			this.keys[70] = new key('f');
			this.keys[71] = new key('g');
			this.keys[72] = new key('h');
			this.keys[73] = new key('i');
			this.keys[74] = new key('j');
			this.keys[75] = new key('k');
			this.keys[76] = new key('l');
			this.keys[77] = new key('m');
			this.keys[78] = new key('n');
			this.keys[79] = new key('o');
			this.keys[80] = new key('p');
			this.keys[81] = new key('q');
			this.keys[82] = new key('r');
			this.keys[83] = new key('s');
			this.keys[84] = new key('t');
			this.keys[85] = new key('u');
			this.keys[86] = new key('v');
			this.keys[87] = new key('w');
			this.keys[88] = new key('x');
			this.keys[89] = new key('y');
			this.keys[90] = new key('z');
			this.keys[91] = new key('windowKeyLeft');
			this.keys[92] = new key('windowKeyRight');
			this.keys[93] = new key('select key');
			this.keys[96] = new key('numpad0');
			this.keys[97] = new key('numpad1');
			this.keys[98] = new key('numpad2');
			this.keys[99] = new key('numpad3');
			this.keys[100] = new key('numpad4');
			this.keys[101] = new key('numpad5');
			this.keys[102] = new key('numpad6');
			this.keys[103] = new key('numpad7');
			this.keys[104] = new key('numpad8');
			this.keys[105] = new key('numpad9');
			this.keys[106] = new key('multiply');
			this.keys[107] = new key('plus');
			this.keys[109] = new key('minus');
			this.keys[110] = new key('decimal point');
			this.keys[111] = new key('divide');
			this.keys[112] = new key('f1');
			this.keys[113] = new key('f2');
			this.keys[114] = new key('f3');
			this.keys[115] = new key('f4');
			this.keys[116] = new key('f5');
			this.keys[117] = new key('f6');
			this.keys[118] = new key('f7');
			this.keys[119] = new key('f8');
			this.keys[120] = new key('f9');
			this.keys[121] = new key('f10');
			this.keys[122] = new key('f11');
			this.keys[123] = new key('f12');
			this.keys[144] = new key('numLock');
			this.keys[145] = new key('scrollLock');
			this.keys[186] = new key('semi-colon');
			this.keys[187] = new key('equal');
			this.keys[188] = new key('comma');
			this.keys[189] = new key('dash');
			this.keys[190] = new key('period');
			this.keys[191] = new key('forward slash');
			this.keys[192] = new key('grave accent');
			this.keys[219] = new key('open bracket');
			this.keys[220] = new key('back slash');
			this.keys[221] = new key('close braket');
			this.keys[222] = new key('single quote');
			
	},
	getByName: function (keyName) {
		"use strict";
		for (var i = 0; i < this.keys.length; i++) {
			if (this.keys[i]){
				if (this.keys[i].name == keyName){
					return this.keys[i];
				}
			}
		}
		return false;
	},
	getByCode: function (keyCode) {
		"use strict";
		return this.keys[keyCode]
	},
	onPress: function (event) {
		"use strict";
		var key = this.getByCode(event.keyCode);

		// log the prev status
		key.wasPressed = key.pressed;		

		//change the status
		key.pressed = true;
		
		//stop event propagation
		event.preventDefault();
		event.stopPropagation();
	},
	onRelease: function (event) {
		"use strict";
		var key = this.getByCode(event.keyCode);

		// log the prev status
		key.wasPressed = key.pressed;
		
		//change the status
		key.pressed = false;

		//stop event propagation
		event.preventDefault();
		event.stopPropagation();		
	},
	$: function (keyName) {
		return this.getByName(keyName);
	},
	tick: function () {
		"use strict";
/*
		var multiplier = 100;
		var multiplierRot = 10;
		//console.log(this.$('upArrow'));
		//assegno alcune funzioni ai tasti
		var gfx = this.game.modules.graphic;
		
		if( this.$('upArrow').pressed){
			gfx.camera.position.y += 0.05*multiplier;
		}
		if( this.$('downArrow').pressed){
			gfx.camera.position.y -= 0.05*multiplier;
		}
		if( this.$('leftArrow').pressed){
			gfx.camera.position.x -= 0.05*multiplier;
		}
		if( this.$('rightArrow').pressed){
			gfx.camera.position.x += 0.05*multiplier;
		}
		if( this.$('a').pressed){
			gfx.camera.position.z -= 0.05*multiplier;
		}
		if( this.$('d').pressed){
			gfx.camera.position.z += 0.05*multiplier;
		}	
		if( this.$('c').pressed && this.$('c').statusHasChanged()){
			if (cicle <  gfx.objects.length-1){
				cicle++;
			}else{
				cicle=0;
			}
			//console.log('Objects in the scene: '+gfx.objects.length +' selecting n.: '+cicle);
			//gfx.camera.position = this.objects[0].position.clone();
			gfx.camera.position.x = gfx.objects[cicle].position.x;
			gfx.camera.position.y = gfx.objects[cicle].position.y;
			gfx.camera.position.z = gfx.objects[cicle].position.z;

			gfx.camera.position.x+=10;
			
			//var lookAtPosition = gfx.objects[0].gfx.position.clone()		zz
			//gfx.camera.lookAt( lookAtPosition )
		}
		if( this.$('numpad8').pressed){
			gfx.camera.rotation.x += 0.01*multiplierRot; 
		}
		if( this.$('numpad2').pressed){
			gfx.camera.rotation.x -= 0.01*multiplierRot; 
		}		
		if( this.$('numpad4').pressed){
			gfx.camera.rotation.y += 0.01*multiplierRot; 
		}
		if( this.$('numpad6').pressed){
			gfx.camera.rotation.y -= 0.01*multiplierRot; 
		}
*/
var gameMode='race';
	switch (gameMode){
		case 'race':
			//##################################
			//  CAMERA
			//##################################
			//eable-disable free camera mouvements 
			this.$('m').description ='Enable or disable free camera movements';
			if( this.$('m').pressed && this.$('m').statusHasChanged()){
				this.game.modules.graphic.cameraMovementsEnabled = !this.game.modules.graphic.cameraMovementsEnabled;
			}

			//change the speed of the camera when we press shift
			if( this.$('shift').pressed && this.$('shift').statusHasChanged()){
				this.game.modules.graphic.controls.movementSpeed = 160;
			}
			if( !this.$('shift').pressed && this.$('shift').statusHasChanged()){
				this.game.modules.graphic.controls.movementSpeed = 40;
			}
			
			//##################################
			//  HELP MENU
			//##################################			
			this.$('f1').description ='Enable help menu';
			if( this.$('f1').pressed){
					var out='';
				for (var i = 0; i < this.keys.length; i++) {
					console.log(this.keys.length);
					var key= this.keys[i];
					if(key){

					//if(key.description){
						out= key.name + ' = '+key.description+'<br>';
					//}						
						}

				}
				alert(out);
			}			
			
			//##################################
			//  MISC
			//##################################
			//other things
			if( this.$('i').pressed){
				this.game.modules.phisic.objects[0].psx.velocity.set(  2,
									   0,
									   0);
			}
			
			if( this.$('i').pressed){
				this.game.modules.phisic.objects[0].psx.velocity.set(  2,
									   0,
									   0);
			}
			if( this.$('k').pressed){
				this.game.modules.phisic.objects[0].psx.velocity.set(  -2,
									   0,
									   0);
			}
			if( this.$('j').pressed){
			}
			if( this.$('l').pressed){
			}

			break;
		case 'menu':
			if( this.$('escape').pressed){
				this.$('f1').description ='Quit the menu';
			}
			break;
		default:
		break;
	};
	},
});
