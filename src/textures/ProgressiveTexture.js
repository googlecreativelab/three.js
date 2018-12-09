import { Texture } from './Texture';
 function ProgressiveTexture( size, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {
  Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );
  this.size = size;
  this.dataSegment = this.size * this.size * 3;
  this.data = new Uint8Array( this.size * this.size * 3 );
  this.dataOffsetY = 0;
  this.image = { data: this.data, width: this.size, height: this.size };
  this.uploaded = false;
  this.loaded = false;
  this.firstPassComplete = false;
  this.displayed = false;
  this.busy = false;
  this.generateMipmaps = false;
  this.premultiplyAlpha = false;
  this.needsUpdate = true;
  this.nPasses = 0;
  this.xhr = new XMLHttpRequest();
  this.xhr.addEventListener( 'progress', this.onProgress.bind( this ), false );
  this.xhr.addEventListener( 'load', this.onLoad.bind( this ), false );
  this.xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
 }
 function onDisplayComplete( callback ) {
  if ( !this.displayed ) {
    this.displayCompleteCallback = callback;
  } else {
    callback( this );
  }
 }
 function loadWithWorker( worker ) {
  this.initWorker( worker );

  this.data = null;
  this.xhr.open( 'GET', this.url );
  this.xhr.send();
 }
 function initWorker( worker ) {
  this.worker = worker;
  this.busy = false;
 }
 function onWorkerMessage( event ) {
  this.data = event.data;
  this.dataSegment = this.size * 32 * 3;
  this.dataOffsetY = this.size - 32;
  this.busy = false;
  this.nPasses++;
  // console.log( 'new data offset: ' + this.dataOffsetY );
  if ( this.loaded ) {
    // console.log( 'loaded pass start' );
    if ( this.onloadedCallback ) {
      this.onloadedCallback( this );
    }
  }
 }
 function onProgress( event ) {
  if ( !this.busy ) {
    var msg = {
      size: this.size,
      data: ( this.xhr.mozResponseArrayBuffer || this.xhr.mozResponse || this.xhr.responseArrayBuffer || this.xhr.response )
    };
         if ( this.data == null || this.data.length == 0 ) {

            this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;
            this.worker.postMessage( msg );
            this.busy = true;
         }
  }
 }
 function onLoad( event ) {
  var msg = {
    size: this.size,
    data: ( this.xhr.mozResponseArrayBuffer || this.xhr.mozResponse || this.xhr.responseArrayBuffer || this.xhr.response )
  };

  this.loaded = true;
  // console.log( 'on load complete' );
  this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;
    this.worker.postMessage( msg );
 }
 function onLoadComplete( callback ) {
  if ( this.loaded ) {

    callback( this );
  } else {
    this.onloadedCallback = callback;
  }
 }
 function displayComplete() {
  if ( !this.displayed ) {
    this.displayed = true;
    if ( this.displayCompleteCallback ) {
      this.displayCompleteCallback( this );
    }
  }
 }

ProgressiveTexture.prototype = Object.create( Texture.prototype );
ProgressiveTexture.prototype.constructor = ProgressiveTexture;
ProgressiveTexture.prototype.initWorker = initWorker;
ProgressiveTexture.prototype.onProgress = onProgress;
ProgressiveTexture.prototype.onWorkerMessage = onWorkerMessage;
ProgressiveTexture.prototype.onLoadComplete = onLoadComplete;
ProgressiveTexture.prototype.onLoad = onLoad;
ProgressiveTexture.prototype.onDisplayComplete = onDisplayComplete;
ProgressiveTexture.prototype.displayComplete = displayComplete;
ProgressiveTexture.prototype.loadWithWorker = loadWithWorker;
ProgressiveTexture.prototype.isProgressiveTexture = true;
 export { ProgressiveTexture };