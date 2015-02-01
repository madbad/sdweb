/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.AC3DLoader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

	this.withCredentials = false;

};

THREE.AC3DLoader.prototype = Object.create( THREE.Loader.prototype );

THREE.AC3DLoader.prototype.load = function ( url, callback, texturePath ) {

	var scope = this;

	// todo: unify load API to for easier SceneLoader use

	texturePath = texturePath && ( typeof texturePath === "string" ) ? texturePath : this.extractUrlBase( url );

	this.onLoadStart();
	this.loadAjaxTEXT( this, url, callback, texturePath );

};

THREE.AC3DLoader.prototype.loadAjaxTEXT = function ( context, url, callback, texturePath, callbackProgress ) {

	var xhr = new XMLHttpRequest();

	var length = 0;

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === xhr.DONE ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				if ( xhr.responseText ) {

					var result = context.parse( xhr.responseText, texturePath );
					callback( result.geometry, result.materials );

				} else {

					console.warn( "THREE.AC3DLoader: [" + url + "] seems to be unreachable or file there is empty" );

				}

				// in context of more complex asset initialization
				// do not block on single failed file
				// maybe should go even one more level up

				context.onLoadComplete();

			} else {

				console.error( "THREE.AC3DLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === xhr.LOADING ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	};

	xhr.open( "GET", url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );

};

THREE.AC3DLoader.prototype.parse = function ( ac3d, texturePath ) {

	var scope = this,
/**/materials='',
	geometry = new THREE.Geometry(),
	scale = ( ac3d.scale !== undefined ) ? 1.0 / ac3d.scale : 1.0;

	parseModel( scale );

	geometry.computeCentroids();
	//console.log('model parse ok');
	geometry.computeFaceNormals();

	function parseModel( scale ) {
/*
		faces = .faces,
		vertices = ac3d.vertices,
		normals = ac3d.normals,
		colors = ac3d.colors,
*/
		//console.log(ac3d);
		rows=ac3d.split('\r\n')
		console.log(rows);

		var howManyVertices=0;		
		var howManySurf=0
		var howManySurfacePos=0
		var nextExpecting=['AC3Db'];
		
		var vertices=[];
		var surfacePos=[];
		
		for (var i=0;i<rows.length;i++){

			var row=rows[i];

			var words= row.split(' ');
			
			var pad = "000000";
			var numRow = (pad+(i+1)).slice(-pad.length)+' ';

			var test=words[0];
			
			if( nextExpecting!=words[0] &&
				nextExpecting[0]!=words[0] &&
				nextExpecting[1]!=words[0] &&
				nextExpecting[2]!=words[0] &&
				nextExpecting[3]!=words[0] &&
				test!='0' &&				
				test!='' &&
				
				!parseInt(test*10000)){
				
				console.log(numRow + ' **unexpected**: '+words[0] + ' **Expecting**: '+nextExpecting);			
			
			}else{
			
				//console.log('**ok**');			
			
			}
			
			switch(words[0]){
			case 'AC3Db':
				//console.log(numRow + 'AC3D Parser Found Header');
				nextExpecting=['MATERIAL'];
				break;
			case 'MATERIAL':
				//console.log(numRow + 'AC3D Parser Found Material');
				nextExpecting=['OBJECT'];
				break;
			case 'OBJECT':
				// world, poly, group.
				//console.log(numRow + 'AC3D Parser Found an Object of type: ' + words[1]);
				nextExpecting=['name', 'kids'];
				break;
			case 'name':
				//console.log(numRow + 'AC3D Parser ----> the name of the object is: ' + words[1]);
				nextExpecting=['loc'];
				break;
			case 'loc':
				//console.log(numRow + 'AC3D Parser ----> the center of the object is: ' + words.slice(1));
				nextExpecting=['texture'];
				break;
			case 'texture':
				//console.log(numRow + 'AC3D Parser ----> the texture of the object is: ' + words[1]);
				nextExpecting=['crease'];
				break;
			case 'crease':
				//console.log(numRow + 'AC3D Parser ----> crease: ' + words[1]);
				nextExpecting=['numvert'];
				break;
			case 'numvert':
				//number of the vertices (of the object) that follow
				//console.log(numRow + 'AC3D Parser ----> the object has vertices: ' + words[1]);
				nextExpecting = ['vertices'];
				howManyVertices = words[1]
				break;
			case 'numsurf':
				//number of the surfaces (of the object) that follow
				//console.log(numRow + 'AC3D Parser ----> the object has surfaces: ' + words[1]);
				nextExpecting=['SURF'];
				howManySurf = words[1]
				break;
			case 'SURF':
				//the type of the surface (of the object)
				//console.log(numRow + 'AC3D Parser ----> the object has surface: ' + words[1]);
				nextExpecting=['mat'];
				howManySurf--;
				//if(howManySurf==0){ 
				//	nextExpecting=['mat'];
				//}
				break;
			case 'mat':
				//the index of the material (of the object)
				//console.log(numRow + 'AC3D Parser ----> the object has material with index: ' + words[1]);
				nextExpecting=['refs'];
				break;
			case 'refs':
				//number of vertices (of the surface) that follow
				//console.log(numRow + 'AC3D Parser ----|---> the surface has vertices: ' + words[1]);
				nextExpecting=['surfacePos'];
				howManySurfacePos = words[1];			
				break;
			case 'kids':
				//the kids objects (of the object) // this basically close the object
				//console.log(numRow + 'AC3D Parser ----> the object has kids: ' + words[1]);
				nextExpecting=['OBJECT'];
				break;
			case '':
				break;
			default:
				//console.log(numRow + 'AC3D Parser ----> found vertice: ' + words);
				//console.log('default');
				if(nextExpecting=='vertices'){
						howManyVertices--;
						//console.log(numRow + 'AC3D Parser ----> found vertices remaining: ' + howManyVertices);
						vertices.push({'x':words[0],'y':words[1],'z':words[2]});
						if(howManyVertices==0){
							nextExpecting=['kids', 'numsurf'];							
						}
				}
				if(nextExpecting=='surfacePos' || nextExpecting[0]=='surfacePos'){
						howManySurfacePos--;
						//console.log(numRow + 'AC3D Parser ----> found SurfacePos remaining: ' + howManySurfacePos);
						surfacePos.push({'a':words[0],'b':words[1],'c':words[2]});
						if(howManySurfacePos==0 && howManySurf>0){
							nextExpecting=['SURF'];								
						}else{
							nextExpecting=['surfacePos', 'kids'];							
						}
						//console.log(numRow + 'AC3D Parser ----> found vertice: ' + words);
				}	
				break;
			}
		
		}
		
		/*
		//here whe expect to have parsed the file and have
		surfacePos     as an array of surfaces
		vertices   as an array of vertices
		normals    ??
		colors     ??material
		*/
		

		//console.log('vertices: '+vertices.length+vertices);
		//console.log('surfaces: '+surfacePos.length+surfacePos);

		//make all vertices  3d three.vector
		var numVertices=vertices.length;

		for (var i=0; i<numVertices; i++){
			var tVertex=vertices[i];
			
			vertex = new THREE.Vector3();
			
			vertex.x = tVertex.x * scale;
			vertex.y = tVertex.y * scale;
			vertex.z = tVertex.z * scale;
			
			geometry.vertices.push( vertex );
		}
		
		console.log(geometry.vertices);

			
		//make all surfaces a 3d three.face

			//hasMaterial         = isBitSet( type, 1 );
			//hasFaceUv           = isBitSet( type, 2 );
			//hasFaceVertexUv     = isBitSet( type, 3 );
			//hasFaceNormal       = isBitSet( type, 4 );
			//hasFaceVertexNormal = isBitSet( type, 5 );
			//hasFaceColor	    = isBitSet( type, 6 );
			//hasFaceVertexColor  = isBitSet( type, 7 );

			//console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);
		var numFaces=surfacePos.length;

		for (var i=0; i<numFaces; i++){
			var tFace=surfacePos[i];
			/*start*/
			var normal = new THREE.Vector3( 0, 1, 0 ); 
			var color = new THREE.Color( 0xffaa00 ); 
			var face = new THREE.Face3( 0, 1, 2, normal, color, 0 );
			/*end*/
/*
			face = new THREE.Face3();
				
			face.a = tFace.a;
			face.b = tFace.b;
			face.c = tFace.c;
*/
			geometry.faces.push( face );
		}

	}
/*
	if ( this.needsTangents( materials ) ) {

		geometry.computeTangents();

	}
*/
	return {
		geometry: geometry,
		materials: materials
	};

};
