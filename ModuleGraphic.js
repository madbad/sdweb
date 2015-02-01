(function () {
    "use strict";
}());

var GraphicModule = Module.extend({
	init: function (game) {
		"use strict";

		//the scene we gonna render
		this.scene = new THREE.Scene();

		//camera
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
		//this.camera = new THREE.PerspectiveCamera( 45, 300 / 300, 1, 400 );
		this.camera.position.x=100;
		this.camera.position.y=100;
		this.camera.position.z=100;
		
		this.cameraMovementsEnabled=false;

		//setup camera controls
		this.controls = new THREE.FirstPersonControls(this.camera);
		this.controls.movementSpeed = 40;
		this.controls.lookSpeed = 0.05;
		this.controls.lookVertical = true;
		this.clock = new THREE.Clock();

		//add the default camera
		this.scene.add(this.camera);

		//this will keep track of the object added to the scene
		this.objects = [];
		
		//an array full of objects to be loaded
		this.loadQueque = []
/*
// plane
var plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshNormalMaterial());
plane.overdraw = true;
this.scene.add(plane);
*/
		//light
		var ambientLight = new THREE.AmbientLight(0xffffff);
		this.scene.add(ambientLight);

		/*
		this.myLight = new THREE.PointLight(0xDB7500);
		this.myLight.position.x = 0;
		this.myLight.position.z = 0;
		this.myLight.position.y = 1000;
		this.myLight.intensity = 0.5;
		this.scene.add(this.myLight);
		*/
		//var color = 0x95CEDE; //sera luminosa
		//var color = 0xEBB134; //tramonto/alba
		var color = 0xFFF9DE; //giorno
		
/*		
		this.directionalLight = new THREE.DirectionalLight(color);
		this.directionalLight.position.x = 100;
		this.directionalLight.position.y = 100;
		this.directionalLight.position.z = -200;
		this.directionalLight.position.normalize();
		
		//shadow settings
		this.directionalLight.castShadow = true;
		this.directionalLight.shadowDarkness = 0.5;
		this.directionalLight.shadowCameraLeft = -2000;
		this.directionalLight.shadowCameraRight = 2000;
		this.directionalLight.shadowCameraTop = 2000;
		this.directionalLight.shadowCameraBottom = -2000;
		this.scene.add(this.directionalLight);
*/
		//renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			precision: "highp",
		});
			this.renderer.setSize( window.innerWidth-20, window.innerHeight-2 );
		
		//update the renderer size when the windows is realoded
		window.onresize= function (){
			console.log('resizing renderer:',window.innerWidth, window.innerHeight);
			this.renderer.setSize( window.innerWidth-20, window.innerHeight-2 );
		}.bind(this);
		//this.renderer.setSize( 400, 400 );
		this.renderer.setDepthTest(true);
		
		/*generate a skydome*/
		var geometry   = new THREE.SphereGeometry(2500, 7, 7)
		var material  = new THREE.MeshPhongMaterial({
				//color:0xFF0000,
				//wireframe: true,
				map: THREE.ImageUtils.loadTexture('./background.jpg'),
				//overdraw: true,
			side: THREE.DoubleSide, //neded to paint the texture inside of the sphere
	
		});

		var skyDome = new THREE.Mesh(geometry, material)
		this.scene.add( skyDome);

		
		//append the renderer to the dom
		document.body.appendChild( this.renderer.domElement );

	},
	tick: function () {
		//load the needed meshes from the quequeList
		if(this.loadQueque.length > 0){
			for (var i=this.loadQueque.length-1; i>=0; i--){
				var obj = this.loadQueque[i];
				this.add(obj);
				
				//remove the object loaded from the queque list
				var index = this.loadQueque.indexOf(obj);
				this.loadQueque.splice(index, 1);
			}
		}
		
		//update objects visual positions
		for (var i=0; i<this.objects.length; i++){
			var obj = this.objects[i]; 
			if(obj.gfx){
				//console.log(obj.name, ' :: ',obj.gfx.position.x);

				obj.gfx.position.x = obj.position.x;
				obj.gfx.position.y = obj.position.y;
				obj.gfx.position.z = obj.position.z;
				
				obj.gfx.rotation.x = obj.rotation.x;
				obj.gfx.rotation.y = obj.rotation.y;
				obj.gfx.rotation.z = obj.rotation.z;
				obj.gfx.rotation.w = obj.rotation.w;

			}
		}
		//update camera position based on controls
		if(this.cameraMovementsEnabled){
			var delta = this.clock.getDelta();
			this.controls.update(delta);
		}

		//render the scene
		this.renderer.render(this.scene, this.camera);

	},
	add: function (obj){
		var self = this; /*I dont like this*/

		//if no path for the textures is set - set it to the same folder as the ac3d file
		if(!obj.texturePath){
			obj.texturePath = getPath(obj.meshUrl);
		}
		
		//this will be called afted the ac3d file has been parsed
		var saveDataToObj = function ( geometries, materials ) {
			this.geometries = geometries;
			this.materials = materials;
			self.addMeshGroup(this);
		}

		//when whe have loaded (and parsed) the file... save the data into our obj and call addMeshGroup
		this.loader.load( obj.meshUrl, saveDataToObj.bind(obj));
	
	},
	register: function (obj){
		obj.gfxId= this.objects.length;
		this.objects.push(obj)
	},

	remove: function () {
	
	},


	addMeshGroup: function (obj) {
	
		var geometries = obj.geometries;
		var materials = obj.materials;
		var texturePath = obj.texturePath;

		var meshGroup = new THREE.Object3D();
		var textures = [];

		for (var i=0; i< geometries.length; i++){
			var geometry= geometries[i];
			if (materials[i].hasOwnProperty('texture')){
				if(materials[i].texture==undefined){
					materials[i].texture='none';
				}
				var textureUrl= texturePath+materials[i].texture.replace(/"/gi,'');
			}else{
				var textureUrl= 'none';
			}
			
			if(!textures[textureUrl]){
				textures[textureUrl]= THREE.ImageUtils.loadTexture( textureUrl )
				/*test*/
				
				textures[textureUrl].WrapS = textures[textureUrl].WrapT = THREE.RepeatWrapping;
				textures[textureUrl].repeat.set(1,1);
				
			}

			//enable tranparency only for textures that use if (those that has _n in the name)
			if(textureUrl.search('_n')){
				hasTransparency=true;
			}else{
				hasTransparency=false;
			}

			var material = new THREE.MeshPhongMaterial({
				//color:0xFF0000,
				wireframe: false,
				map: textures[textureUrl],
				//overdraw: true,
		/**/	//side: THREE.DoubleSide,
		/**/	depthTest: hasTransparency,
				depthWrite: hasTransparency,
		/**/	transparent: hasTransparency,
			});
			var mesh = new THREE.Mesh( geometry, material );
			meshGroup.add(mesh);
		}

		//set position
		meshGroup.position.x = obj.position.x;
		meshGroup.position.y = obj.position.y;
		meshGroup.position.z = obj.position.z;
		
		//set rotation
		meshGroup.rotation.x = obj.rotation.x*(Math.PI/180);
		meshGroup.rotation.y = obj.rotation.y*(Math.PI/180);
		meshGroup.rotation.z = obj.rotation.z*(Math.PI/180);
		
		//scale
		meshGroup.scale.x = obj.scale.x;
		meshGroup.scale.y = obj.scale.y;
		meshGroup.scale.z = obj.scale.z;
		
		//shadows setting
		//meshGroup.castShadow = true;
		//meshGroup.receiveShadow = true;
		
		//save a reference on the "global" obj
		obj.gfx=meshGroup;

		//add it to the scene
		this.scene.add(meshGroup);

		//save the object in our list
		this.register(obj.gfx)

		//exit
		return meshGroup;
	},
	loader : new THREE.AC3DLoader(),
})

/*#############################################################################################

	HELPER FUNCTIONS HERE

###################*/

// custom global variables
var projector, mouse = { x: 0, y: 0 };
	
//targetList.push(sphere);

//////////////////////////////////////////////////////////////////////

// initialize object to perform world/screen calculations
projector = new THREE.Projector();

// when the mouse moves, call the given function
document.addEventListener( 'mousedown', onDocumentMouseDown, false );

function onDocumentMouseDown( event ) 
{
//console.log('mouse...');
	var camera = myGame.modules.graphic.camera;
	var targetList =  myGame.modules.graphic.objects;
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
//	console.log("Click.");
//	console.log("Targets: "+targetList.length);	
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

//	console.log("Mouse: "+toString(mouse));		
	// find intersections

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
//	console.log(targetList);
	// create an array containing all objects in the scene with which the ray intersects
	// the second parameter is used to tell the raycaster to be recursive on objects group (that we are using)
	var intersects = ray.intersectObjects( targetList, true );
//	console.log('You have clicked on:',intersects);
	// if there is one (or more) intersections
	if ( intersects.length > 0 )
	{
//		console.log("Hit @ " + toString( intersects[0].point ) );
		// change the color of the closest face.
		//intersects[ 0 ].face.color.setRGB( 0.3, 0.3, 0.3 ); 
		//intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
		//intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
		
		
		//reset prev modifcations
		for (var i=0; i < myGame.mouseIntersections.length; i++){
			myGame.mouseIntersections[ i ].object.scale = {x:1,y:1,z:1};
		}
		
		
		for (var i=0; i < intersects.length; i++){
			//intersects[ i ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 );
			intersects[ i ].object.visible=false;
			//intersects[ i ].object.scale = {x:1.05,y:1.05,z:1.05};
		}
		

		
		//carNameList.lenght
		//var carName = getRandomInt()
		//var randomCarNumber = getRandomInt(0,myGame.carNamesList.length);
		/*
		var randomCarNumber = getRandomInt(60,64);
		var carName = myGame.carNamesList[randomCarNumber];
		var carPosition = intersects[0].point;
		carPosition.y = carPosition.y;
		console.log(carName, carPosition);
		myGame.addCar(carName, carPosition);
		*/
		myGame.mouseIntersections = intersects;
	}

}

function toString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }
