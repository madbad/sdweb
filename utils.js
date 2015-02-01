/*
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
*/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*
 * 
 * 
*/
function getPath(url){
	var pieces = url.split('/')
	pieces.pop();
	var path = pieces.join('/')+'/';
	return path;
}
/*
 * 
 * 
*/
function ajaxGet ( options ) {
	
	//we need some ore check here
	if(!options){
		var options = {
			bindTo:'',
			url:'',
			callback:'',
			callbackProgress:'', 
		};
	}

	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain');
	var length = 0;
	xhr.onreadystatechange = function () {
		if ( xhr.readyState === xhr.DONE ) {
			if ( xhr.status === 200 || xhr.status === 0 ) {
				if ( xhr.responseText ) {
					options.callback( xhr.responseText );//.bind(options.bindTo);
				} else {
					console.warn( "[" + options.url + "] seems to be unreachable or file there is empty" );
				}
			} else {
				console.error( "Couldn't load [" + options.url + "] [" + xhr.status + "]" );
			}
		} else if ( xhr.readyState === xhr.LOADING ) {
			if ( options.callbackProgress ) {
				if ( length === 0 ) {
					length = xhr.getResponseHeader( "Content-Length" );
				}
				options.callbackProgress( { total: length, loaded: xhr.responseText.length } );
			}
		} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {
			length = xhr.getResponseHeader( "Content-Length" );
		}
	};

	xhr.open( "GET", options.url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );
};
/*
 *example usage
 * 
ajaxGet({
	url:'./utils.js',
	callback:function(text){console.log(text);alert(text)},
	})
*/
