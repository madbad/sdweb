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
	xhr.overrideMimeType('text/plain');
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
	var myAcFile= new AC.File(ac3d);
	var scale = 1;
	var allGeometries = [];
	var allMaterials = [];
	
	var hasChilds = true;

	//console.log(myAcFile);
	parseModel(myAcFile.objects[0]);
	

	//console.log('model parse ok');

	function parseModel( object, scale = 1, transformPosition = {'x':0, 'y':0, 'z':0} ) {
		var geometry = new THREE.Geometry();
		var material = {};
		material.texture = object.texture;
		geometry.faceVertexUvs = [];
		geometry.faceVertexUvs[0] = [];
		
		

		//make all vertices  3d three.vector
		for (var i=0; i<object.vertices.length; i++){
			var tVertex=object.vertices[i];

/*hack*/		//log the transform for the childs
		transformPosition.x += object.position.x;
		transformPosition.y += object.position.y;
		transformPosition.z += object.position.z;
			//apply the transform from the parent
/*hack*/	tVertex.applyPositionTransform(transformPosition)
			
			vertex = new THREE.Vector3();
			
			vertex.x = tVertex.x * scale;
			vertex.y = tVertex.y * scale;
			vertex.z = tVertex.z * scale;
			
			geometry.vertices.push( vertex );
		}
		
		// faces and uv work
		for (var h=0; h < object.surfaces.length; h++){
			//surface to vertices "link"
			var curSurface = object.surfaces[h];

			//uv to surface "link"
			geometry.faceVertexUvs[0].push([
				new THREE.Vector2(curSurface.uvs[0].u,curSurface.uvs[0].v),
				new THREE.Vector2(curSurface.uvs[1].u,curSurface.uvs[1].v),
				new THREE.Vector2(curSurface.uvs[2].u,curSurface.uvs[2].v),
			]); // uvs
			
			//three.js face
			face = new THREE.Face3();
			
			face.a = curSurface.uvs[0].vertexID;
			face.b = curSurface.uvs[1].vertexID;
			face.c = curSurface.uvs[2].vertexID;
			
			var normal = new THREE.Vector3( 0, 1, 0 ); 
			var color = new THREE.Color( 0xffaa00 ); 
			var face = new THREE.Face3( face.a, face.b, face.c, normal, color, 0 );

			geometry.faces.push( face );
			
		}
		
		//do some three.js stuff
		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeFaceNormals();

		
		//and continue to go dows to the childs
		if (object.hasOwnProperty('objects')){
			for (var i=0; i< object.objects.length; i++){
				 parseModel ( object.objects[i], scale , transformPosition); 
			}
		}
		
		//output the result
		allGeometries.push(geometry);
		allMaterials.push(material)
	}


/*
	if ( this.needsTangents( materials ) ) {

		geometry.computeTangents();

	}
*/
//console.log(allGeometries);
	return {
		geometry: allGeometries,
		materials: allMaterials
	};
	

};









var recursion=0;

var AC = {}

AC.File = function (data) {
	this.objects=[];
	this.surfaces=[];
	this.materials=[];
	
	this.data= new RawData(data);
	
	this.parse();
}

AC.File.prototype.parse = function (){
	this.materials=[];
	var data=this.data;
	
	while(data.pending){
		switch(data.nextWord()){
			case 'AC3Db':
				this.version=data.currentWord;//this identifie the version of the AC3D file... we have nothing to do here.
				break;
			case 'MATERIAL':
				this.materials.push(new AC.Material(data));
				break;
			case 'OBJECT':
				this.objects.push(new AC.Object(data));
				break;
			case false:
				data.pending=false;
			case '':
				break;
			default:
				//console.log('test');
				//console.log(this.objects);
				//if(data.currentWord){
					console.log('AC3DLoader - Unable to parse');
					console.log('"'+data.currentWord+'" - '+'on row:'+data.rowsReaden);
				//}
		}
	}
//console.log(this);
	return this;
}

RawData = function (rawData){
	this.data=rawData;
/*to fix some file use the \r\n for new lines some only \n*/
	//this.rows = rawData.split('\r\n');
	this.rows = rawData.split('\n');
	this.words=[];
	
	this.rowsReaden=-1;
	this.wordsReaden=-1;
	
	this.pending=true;

	this.nextRow = function (){
		if ( this.rowsReaden < this.rows.length ){
			this.rowsReaden++;
			//console.log(this.rowsReaden);
			this.currentRow = this.rows[this.rowsReaden];
			return this.currentRow;
		} else {
			//sono arrivato alla fine del file quindi non ritorno niente;
			this.pending=false;
			return false;
		}

	}

	this.nextWord = function (){
		if (this.rowsReaden < 0 || this.wordsReaden >= (this.words.length-1)){
			if(this.rowsReaden == this.rows.length){
				//sono gi� arrivato alla fine della riga e delle righe, non ho pi� niente da fare
				return false;
			}else{
				//sono arrivato alla fine della riga ma ce ne sono delle altre, parto con una nuova
				if(this.nextRow()){
					this.wordsReaden=-1;
					this.words=this.currentRow.split(' ');
				}else{
					// ho finito le righe e anche le parole dell'ultima riga
					return false;
				}
				
			}
		}
		
		this.wordsReaden++;
		
		this.currentWord = this.words[this.wordsReaden];
		return this.currentWord;
	}

	this.resetWord=function (){
		this.currentWord = null;
		this.wordsReaden=-1;
	}
	return this;
}

AC.Material = function (data){
	recursion ++;

	while(data.pending){
		var nextWord=data.nextWord();	
		switch(nextWord){
			case 'rgb':
				this.rgb = [data.nextWord(), data.nextWord(), data.nextWord()];
				break;
			case 'amb':
				this.ambient = [data.nextWord(), data.nextWord(), data.nextWord()];
				break;
			case 'emis':
				this.emission = [data.nextWord(), data.nextWord(), data.nextWord()];
				break;
			case 'spec':
				this.specular = [data.nextWord(), data.nextWord(), data.nextWord()];
				break;
			case 'shi':
				this.shiness = data.nextWord();
				break;
			case 'trans':
				this.trans = data.nextWord();
				break;
			default:
				//is the name of the object
				if(data.currentWord[0]=='"'){
					this.name = data.currentWord;
				}else if( nextWord!='') {
				console.log('AC3DLoader - Unable to parse');
				console.log('"'+data.currentWord+'"'+' on row:'+data.rowsReaden);
				}
				break;
		}
		// we reached the end of the material line quit from here
		if(data.wordsReaden == data.words.length-1){
			//we reached the end of the line: exit
			recursion--;
			return this;
		}
	}
}


AC.Object = function (data){
	recursion++;
	
	//initiliazie some prop
	this.vertices=[];
	this.surfaces=[];
	this.objects=[];
	
	//set some default prop
	this.position={x:0, y:0, z:0};
	
	this.type = data.nextWord();
	
	while(data.pending){
		switch(data.nextWord()){
			case 'name':
				this.name = data.nextWord();
				break;
			case 'texture':
				this.texture = data.nextWord();
				break;
			case 'texrep':
				this.texrepeat = {
					x : data.nextWord(),
					y : data.nextWord(),
				}
				break;
			case 'crease':
				this.crease = data.nextWord();
				break;
			case 'rot':
				this.rotation = data.nextWord();
				break;
			case 'loc':
				this.position = {
					'x' : parseFloat(data.nextWord()),
					'y' : parseFloat(data.nextWord()),
					'z' : parseFloat(data.nextWord()),
				}
				break;
			case 'url':
				this.url = data.nextWord();
				break;
			case 'numvert':
				var vertices = data.nextWord();
				while( vertices >= 1){
					var newVertice = new AC.Vertice(data);
					//newVertice.applyPositionTransform(this.position);
					this.vertices.push(newVertice);
					vertices--;
				}
				break;
			case 'numsurf':
				var surfacesCount = data.nextWord();
				while (surfacesCount >= 1){
					this.surfaces.push( new AC.Surface(data));					
					surfacesCount--;
				}
				break;
			case 'kids':
				var kidsCount=data.nextWord();
				while (kidsCount >= 1){
					data.nextWord(); //objects
					this.objects.push(new AC.Object(data));
					kidsCount--;
				}
				recursion--;
				return this;
				break;
			
			default:
				console.log('AC3DLoader - Unable to parse');
				console.log('['+data.currentWord+']'+'row:'+data.rowsReaden);
		}
	}

	//return this;
}

AC.Surface = function (data){
recursion++;
//console.log('to surface mode'+recursion);

	this.uvs=[];	
	
	while(data.pending){
//next(data)
		switch(data.nextWord()){
			case 'SURF':
				this.type=data.nextWord();		
				break;
			case 'mat':
				this.materialIndex=data.nextWord();			
				break;
			case 'refs':
				var uvsCount=data.nextWord();
				while (uvsCount >= 1){
					this.uvs.push({
						vertexID : data.nextWord(),
						u : data.nextWord(),
						v : data.nextWord(),
					})
					uvsCount--;
				}
				recursion--;
				return this;
				break;
			default:
				console.log('AC3DLoader - Unable to parse');
				console.log('"'+data.currentWord+'" - on '+'row:'+data.rowsReaden);
		}
	}
	//return this;
}

AC.Vertice = function (data){
	recursion++;
	this.x = parseFloat(data.nextWord());
	this.y = parseFloat(data.nextWord());
	this.z = parseFloat(data.nextWord());
	this.applyPositionTransform = function(positionTransform){
		this.x += positionTransform.x;
		this.y += positionTransform.y;
		this.z += positionTransform.z;
	}
	return this;
}

