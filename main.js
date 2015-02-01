(function () {
    "use strict";
}());

var Game = Class.extend({
	init: function () {
		"use strict";
		
		//my game is composed of modules
		//each module is responsible of a part of the game meccanincs
		this.modules = {};
		
		//graphics
		this.modules.graphic = new GraphicModule(this);

		//phisics
		this.modules.phisic = new PhisicModule(this)
		
		//input 
		this.modules.input = new InputModule(this);
		
		//sound
		this.modules.sound = {};
		
		//menu
		this.modules.menu = {};
		
		//this will hold ooll the objects added to the scene
		//included their phisics props
		this.objects = [];
		
		//start the loop
		this.tick();
	},
	startRace: function () {
		var trackName = ''
		var carName = ''
		var opponents = ''
	},
	addCar: function (carName, carPosition={x:1,y:1,z:1}) {
		var car = {}
		car.name = carName;
		car.meshUrl = './data/cars/models/'+carName+'/'+carName+'-src.ac';
		//car.meshUrl = './data/cars/models/'+carName+'/'+carName+'.ac';
		car.xmlFileUrl = './data/cars/models/'+carName+'/'+carName+'.xml';
		car.type='car';
		/*
		car.position = {
			x: 1,
			y: 1,
			z: 1,
		}
		*/
		car.position = carPosition;
		
		car.rotation = {
			x :0,
			y: 0,
			z: 0,
			w: 0,
		}
		
		car.scale = {
			x:1,
			y:1,
			z:1,
		}
		//load the phisics params from the xml file
		ajaxGet({
			url: car.xmlFileUrl,
			callback: function(content) {
			
			var xmlObj = x2js.xml_str2json(content);

			function restructureXml (child, parent){//todo: resta ancor aqualche residuo in caso di array
				if(typeof child === 'object'){
					for (i in child){
						var current = child[i];

						var hasName = current.hasOwnProperty('_name'); 
						if(hasName){
							var propName = current._name;
							delete current._name;
						}

						if(Array.isArray(current)){
							delete child[i];
							restructureXml(current, parent);

						}else if (typeof current === 'object'){
							parent[propName]= current;
							restructureXml(current, parent[propName]);
						}
					}
				}
				return parent;
			}
			car.data = restructureXml(xmlObj.params.section, {});
console.log('Loaded: ', carName, ' with data: ', car.data);
			car.wheels={}
			//add wheels here

			this.addWheel(car, 'FR');
			this.addWheel(car, 'FL');
			this.addWheel(car, 'RR');
			this.addWheel(car, 'RL');

			this.modules.phisic.loadQueque.push(car);
			this.modules.graphic.loadQueque.push(car);
			
		}.bind(this)
		});

		this.objects.push(car)

		var carIndex= {
			gfx: this.modules.graphic.loadQueque.indexOf(car),
			psx: this.modules.phisic.loadQueque.indexOf(car)
			}
		return carIndex;
	},
	addTrack: function (trackCategory, trackName) {
		var track = {}
		track.name = trackName;
		track.meshUrl = './data/tracks/'+trackCategory+'/'+trackName+'/'+trackName+'-src.ac';
		track.xmlFileUrl = './data/tracks/'+trackCategory+'/'+trackName+'/'+trackName+'.xml';
		track.type='track';
		//console.log(track.meshUrl);
		//console.log(track.xmlFileUrl);
		
		track.position = {
			x :0,
			y: 0,
			z: 0,
		}
		
		track.rotation = {
			x :0,
			y: 0,
			z: 0,
			w: 0,
		}
		
		track.scale = {
			x:1,
			y:1,
			z:1,
		}
		
		this.objects.push(track)

		
		this.modules.phisic.loadQueque.push(track);
		this.modules.graphic.loadQueque.push(track);
	},
	//generic
	addWheel: function (car, wheelPosition) {
		if(wheelPosition == 'FR'){
			var wheel = {
				name: 'FR wheel',
				position: {
					z: car.data['Front Right Wheel']['ypos']['_val'],
					y: 0.15,
					x: car.data['Front Axle']['xpos']['_val'],
				},
				meshUrl: './data/data/objects/wheel0-src.ac',
				texturePath: './data/cars/models/'+car.name+'/',
				rotation:{x:0,y:0,z:0,w:0,},
				scale:{x:0.7,y:0.7,z:0.4,},
			}
		}
		
		if(wheelPosition == 'FL'){
			var wheel = {
				name: 'FL wheel',
				position: {
					z: car.data['Front Left Wheel']['ypos']['_val'],
					y: 0.15,
					x: car.data['Front Axle']['xpos']['_val'],
				},
				meshUrl: './data/data/objects/wheel0-src.ac',
				texturePath: './data/cars/models/'+car.name+'/',
				//rotation:{x:0,y:180,z:0,w:0,},
				scale:{x:0.7,y:0.7,z:0.4,},
				rotation:{x:0,y:0,z:0,w:0,},
			}
		}
		
		if(wheelPosition == 'RR'){
			var wheel = {
				name: 'RR wheel',
				position: {
					z: car.data['Rear Right Wheel']['ypos']['_val'],
					y: 0.15,
					x: car.data['Rear Axle']['xpos']['_val'],
				},
				meshUrl: './data/data/objects/wheel0-src.ac',
				texturePath: './data/cars/models/'+car.name+'/',
				//rotation:{x:0,y:0,z:0,w:0,},
				scale:{x:0.7,y:0.7,z:0.4,},
				rotation:{x:0,y:0,z:0,w:0,},
			}
		}
		
		if(wheelPosition == 'RL'){
			var wheel = {
				name: 'RL wheel',
				position: {
					z: car.data['Rear Left Wheel']['ypos']['_val'],
					y: 0.15,
					x: car.data['Rear Axle']['xpos']['_val'],
				},
				meshUrl: './data/data/objects/wheel0-src.ac',
				texturePath: './data/cars/models/'+car.name+'/',
				//rotation:{x:0,y:180,z:0,w:0,},
				scale:{x:0.7,y:0.7,z:0.4,},
				rotation:{x:0,y:0,z:0,w:0,},
			}
		}
		
		wheel.location=wheelPosition;
		wheel.type = 'wheel';
		wheel.car = car;
		
		this.modules.phisic.loadQueque.push(wheel);
		this.modules.graphic.loadQueque.push(wheel);

	},
	tick: function (){
		this.modules.input.tick();
		this.modules.graphic.tick();
		this.modules.phisic.tick();
		requestAnimationFrame(this.tick.bind(this));
	},
	toggleMenu: function (){
		var menu = document.querySelector('.menu');
		//if the menu is hidden
		if(menu.classList.contains('hidden')){
			//show it
			menu.classList.remove('hidden');
		}else{
			//hide it
			menu.classList.add('hidden');
		}
	},

/*
	addFromFile: function (file, texturePath){
		if(!texturePath){
			var texturePath = getPath(file);
		}

		//console.log('loading: '+file);

		var loader = new THREE.AC3DLoader();

		loader.load( file, function ( geometries, materials ) {
			myGame.addMeshGroup(geometries, materials, texturePath );
		});
	
	},
*/
});
