var _log = function() {
	var args;
	if ( !_log.o.isValid ) {
		return;
	}
	args = Array.prototype.slice.call( arguments );
	_log.o.runTime = new Date().getTime() - _log.o.startTime;
	args.push( '  ' + _log.o.runTime + 'ms', '(+' + ( _log.o.runTime - _log.o.lastTime ) + ')' );
	console.log.apply( console, args );
	_log.o.lastTime = _log.o.runTime;
};
_log.o = {
	startTime : new Date().getTime(),
	runTime : 0,
	lastTime : 0,
	isValid : typeof window.console !== 'undefined' ? true : false
};