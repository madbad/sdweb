(function () {
    "use strict";
}());

var PhisicModule = Module.extend({
	init: function (game) {
		"use strict";

		//this will keep track of the object added to the scene
		this.objects = [];
		
		//an array full of objects to be loaded
		this.loadQueque = [];

		// Setup our world
		this.world = new CANNON.World();
		this.world.quatNormalizeSkip = 0;
		this.world.quatNormalizeFast = false;

		var solver = new CANNON.GSSolver();

		this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
		this.world.defaultContactMaterial.contactEquationRegularizationTime = 4;

		solver.iterations = 7;
		solver.tolerance = 0.1;
		var split = true;
		if(split)
			this.world.solver = new CANNON.SplitSolver(solver);
		else
			this.world.solver = solver;

		this.world.gravity.set(0,1,0);//this.world.gravity.set(0,1,0);
		this.world.broadphase = new CANNON.NaiveBroadphase();

		// Create a slippery material (friction coefficient = 0.0)
		var physicsMaterial = new CANNON.Material("slipperyMaterial");
		var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
																physicsMaterial,
																0.0, // friction coefficient
																0.3  // restitution
																);
		// We must add the contact materials to the world
		this.world.addContactMaterial(physicsContactMaterial);
/*
		// Create a sphere
		var mass = 5, radius = 1.3;
		sphereShape = new CANNON.Sphere(radius);
		sphereBody = new CANNON.RigidBody(mass,sphereShape,physicsMaterial);
		sphereBody.position.set(0,5,0);
		sphereBody.linearDamping = 0.9;
		this.world.add(sphereBody);
*/
		// Create a plane
/*
		var groundShape = new CANNON.Plane();
		var groundBody = new CANNON.RigidBody(0,groundShape,physicsMaterial);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
		
		this.world.add(groundBody);
*/
	},
	tick: function () {
		//load the needed meshes from the quequeList
		if(this.loadQueque.length > 0){
			//console.log('PSX need to load items:', this.loadQueque.length);
			for (var i=this.loadQueque.length-1; i>=0; i--){
				var obj = this.loadQueque[i];
				this.add(obj);
				//console.log('PSX loading',obj ,'list to load is', this.loadQueque);
				//remove the object loaded from the queque list
				var index = this.loadQueque.indexOf(obj);
				this.loadQueque.splice(index, 1);
			}
		}
		
		//console.log('updaating psx')
		//do one step in our phisic world
		var timeStep = 1.0 / 60.0; // seconds
		this.world.step(timeStep);
		
		//update.objects.positions from phisics
		for (var i=0; i<this.objects.length; i++){
			var obj = this.objects[i]; 

			obj.position.x = obj.psx.position.x;
			obj.position.y = obj.psx.position.y;
			obj.position.z = obj.psx.position.z;
			
			obj.rotation.x = obj.psx.quaternion.x;
			obj.rotation.y = obj.psx.quaternion.y;
			obj.rotation.z = obj.psx.quaternion.z;
			obj.rotation.w = obj.psx.quaternion.w;
//console.dir(obj.position);
		}

	},
	add: function (obj){
		//console.log(obj);
		switch(obj.type){
			case 'car':
				var car = obj.data;
				//console.log('PSX data',obj.data);
				/*
					var mass = 0.0000001;
				*/
				var halfExtents = new CANNON.Vec3(  
													car['Car']['body width']['_val'],
													car['Car']['body height']['_val'],
													car['Car']['body length']['_val']

												);
				var boxShape = new CANNON.Box(halfExtents);
				var carBody = new CANNON.RigidBody(car['Car']['mass']['_val']*1,boxShape);
				obj.psx = carBody;
				obj.psx.position.set(obj.position.x,
									 obj.position.y,
									 obj.position.z);
									 
				obj.psx.quaternion.set(	obj.rotation.x,
										obj.rotation.y,
										obj.rotation.z,
										0);
				obj.psx.velocity.set(  0,
									   0,
									   0);
				this.world.add(obj.psx);
				//console.log('car body added')
				
				break;
			case 'wheel':
			
				//add wheels
				var wheel = obj;
				var car = wheel.car;
				
				var halfExtents = new CANNON.Vec3(  1,
													1,
													1);
				//var wheelShape = new CANNON.Box(halfExtents);
				var wheelShape = new CANNON.Sphere(1.2);
				var wheelMass = 1;
				var wheelBody = new CANNON.RigidBody(wheelMass,wheelShape);
				var wheelPosition = new CANNON.Vec3(wheel.position.x,
													wheel.position.y,
													wheel.position.z)
				wheel.psx = wheelBody;
				// Hinge the wheels
				var zero = 			 new CANNON.Vec3();
				var leftAxis =       new CANNON.Vec3(0,1,0);
				var rightAxis =      new CANNON.Vec3(0,-1,0);
				var leftFrontAxis =  new CANNON.Vec3(0,1,0);
				var rightFrontAxis = new CANNON.Vec3(0,-1,0);
				/*
				if(true){
					leftFrontAxis =  new CANNON.Vec3(0,0,0);
					rightFrontAxis = new CANNON.Vec3(0,0,0);
					leftFrontAxis.normalize();
					rightFrontAxis.normalize();
				}
				*/
				switch (wheel.location){
				case 'FR':
					var carAxis =rightAxis;
					var wheelAxis =rightAxis;
					break;
				case 'FL':
					var carAxis =leftAxis;
					var wheelAxis =leftAxis;
					break;
				case 'RR':
					var carAxis =rightAxis;
					var wheelAxis =rightAxis;
					break;
				case 'RL':
					var carAxis =leftAxis;
					var wheelAxis =leftAxis;
					break;
				}
				var constraint = new CANNON.HingeConstraint(car.psx,//body A
															wheelPosition,//pivot A
															carAxis,//axis A
															wheelBody,//body B
															zero,//pivot B = il punto di B sul quale ruotare
															wheelAxis);//axis B = su quale asse B deve ruotare sul suo punto
				this.world.add(wheelBody);
				//this.world.addConstraint(constraint);
			
				break;
			case 'track':
//		var groundBody = new CANNON.RigidBody(0,groundShape,physicsMaterial);
//		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
		

				var mass = 0;
				var shape = new CANNON.Box(new CANNON.Vec3(5,2,0.5));
				var body = new CANNON.RigidBody(mass,shape);
				obj.psx = body;
				obj.psx.position.set(obj.position.x,
									 obj.position.y,
									 obj.position.z);
				this.world.add(obj.psx);
				//console.log('carbody added')
				break;
			case 'other':
				break;
		}
		this.register(obj);
	},
	register: function (obj){
		this.objects.push(obj)
	
	},
	remove: function () {
	
	},
})
