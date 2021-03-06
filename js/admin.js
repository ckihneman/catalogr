// setup app info
_m.app = {
	name : 'classics_admin',
	version : '0.0.1',
	api : {
		url : '../php/admin.php'
	}
};

// init ajax hooks
_m.init = function() {
	
	$.ajaxSetup({
		url : _m.app.api.url,
		type : 'GET',
		dataType : 'json',
		timeout : 5000
	});
	
	// callback pre ajax settings extend
	$( 'body' ).ajaxStart( function() {
		// _log( 'ajaxStart' );
	});
	
	// // callback fired right before ajax request is sent
	// $( '#ajax' ).ajaxSend( function( e, jqxhr, settings ) {
	//   	if ( settings.appEvent ) {
	// 		_log( 'ajaxSend', settings.appEvent, 'Show Loader' );
	// 		
	// 		// possible switch for which loader to bring on for different types of loads
	// 		// OR just one for all loads
	// 		var self = $( this );
	// 		self.css( 'display', 'block' );
	// 		setTimeout( function() {
	// 			self.removeClass( 'off' );
	// 		}, 0 );
	// 	}
	// });
	// 
	// // callback fired on ajax success -- global .done()
	// $( '#ajax' ).ajaxSuccess( function( e, xhr, settings ) {
	// 	if ( settings.appEvent ) {
	// 		_log( 'ajaxSuccess', settings.appEvent, 'Hide Loader' );
	// 		
	// 		// ajax worked, remove the loader
	// 		var self = $( this );
	// 		self.addClass( 'off' )
	// 			.one( 'webkitTransitionEnd', function() {
	// 				self.css( 'display', 'none' );
	// 			});
	// 	}
	// });
	// 
	// // calllback fired on ajax error - global .fail()
	$( '#ajax' ).ajaxError( function( e, xhr, settings ){
		$.event.trigger( 'log', [ 'ajax failure, refresh and try again' ] );
		
		_log( 'ajaxError', 'Ajax error: ' + settings.url + ' appEvent: ' + settings.appEvent || 'null' );
	});

	// $.ajaxPrefilter( 'json', function( o, originalOptions, jqXHR ) {
	// 	_log( 'filtering ajaxPrefilter' );
	// 	// check to see if this ajax request came from core -- meaning it has a model reference
	// 	if ( o.model && o.model.name ) {
	// 		// o.model.name -  global event name
	// 		// o.model.obj -  model obj
	// 		_log( 'in prefilter' );
	// 		switch( o.model.name ) {
	// 		case 'login' :
	// 			// o.url = _m.app.api.deals + o.url;
	// 			_log( 'ajaxPrefilter', o.model.name, o );
	// 			break;
	// 		default :
	// 			// jqXHR.abort( 'bad appEvent' );
	// 		}
	// 		
	// 		// extend eventName to options to be caught by ajaxHooks
	// 		// o.appEvent = o.model.name;
	// 		
	// 		// NOTE: 5/4/2011
	// 		// set o.global = true specificaly in a prefilter for jsonp
	// 		// to override line 7592 of jquery 1.6 --
	// 		// this line checks if a request is crossDomain, if it is, global gets set to false
	// 		// if global is set to false, ajaxHooks do NOT fire --
	// 		// i dont know why they think this is a good idea,
	// 		// but adding this here allows all ajaxHooks to fire
	// 		o.global = true;
	// 	}
	// 
	// });

};

/************
 * LOG
************/
_m.models.log = {
	
	// array of objs - user actions
	data : []
};

_v.views.log = {
	$el : $( '#log' ),
	
	model : _m.models.log,
	
	events : {
		'log' : 'log'
	},
	
	log : function( e, msg ) {
		this.render( msg );
		// console.dir( arguments );
	},
	
	render: function( msg ) {
		this.$el.html( '<p>' + msg + '</p>');
	}
};

/************
 * DEALS
************/

// deals model
_m.models.login = {
	// save to local storage or not on data refresh
	localStorage : false,
	
	// dependency
	dependency : false,
	
	// ajax'd data cached here
	data : null,
	
	// bool - ajax - wait to cache data until callback
	isDataWait : false,
	
	// bool - ajax - wait to render view until later or not
	isRenderWait : true,
	
	// response data needs to be properly targed to the correct object
	targetData : false,
	
	// gets fresh batch of deals via ajax jsonp
	get : function() {
		var gThis = this,
			user = $( '#username' ).val(),
			pass = $( '#password' ).val();
		
		// _log( user, pass );
		// returns ajax deferred -- add custom .done and .fail callbacks if desired
		// _m.getJsnop() will call the render of its view in its .done() automatically
		// NOTE: 'deals' param MUST be the name of its view/model
		// ajax type, model obj, paramaters to be sent to php via $.ajax data
		return _m.ajax( 'login', this, { 'action' : 'login', 'username' : user, 'password' : pass } )
			.done( function( data ) {
				// do more stuff after render
				// _log( 'model get done' );
				// _log( data.type + ' ' + data.key );
				
				if ( data.type === 'login' && data.key ) {
					gThis.key = data.key;
					gThis.data = true;
					_v.views.login.hide();
				} else {
					_log( 'login fail' );
				}
			})
			.fail( function() {
				// do more stuff on ajax fail
			});
	}
	
};


// deals view
_v.views.login = {
	// node to append new html to
	$el : $( '#login' ),
	
	init : function() {
		// more setup
	},
	
	// views model for easy access
	model : _m.models.login,
	
	// global events for view -- built by _c.init()
	// key = event name, value = function name
	events : {
		'login' : 'get'
	},
		
	// gets fresh batch of deals via ajax jsonp
	get : function( e ) {
		
		this.model.get()
			// attach extra handlers to modify view on response
			// this is the last set of done/fails called
			.done( function() {
				// do more stuff after render
			})
			.fail( function() {
				// do more stuff on ajax fail
			});
			
	},
	
	// toggle deals opacity between 1 and 0
	toggle : function( fn ) {
		this.$el.animate({
			opacity : 'toggle'
		}, 1000, fn );
		return this;
	},
	
	// pushed ajax'd data from _m.getJsonp (on ajax done)
	hide : function() {
		// var gThis = this;
		
		this.toggle( function() {
			$.event.trigger( 'newShow' );
		});
		
		// this.$el.html( '<p class="info">login success</p>' );
		$.event.trigger( 'log', [ 'login success' ] );
		
		
		// setTimeout( function() {
		// 	gThis.toggle();
		// }, 1000 );

	}
};


// newItem 
// model
_m.models.newItem = {
	// save to local storage or not on data refresh
	localStorage : false,
	
	// database direction
	db : 'new',
	
	// dependency
	dependency : false,
	
	// ajax'd data cached here
	data : null,
	
	isDataWait : false,
	isRenderWait : true,
	
	// response data needs to be properly targed to the correct object
	targetData : false,
	
	// attempts to set new deal
	set : function( data ) {
		// add action to data map
		data.action = 'new';
		
		// add key to data map
		data.key = _m.models.login.key;
		
		_log( data );
		
		// return deferred to view
		return _m.ajax( 'newItem', this, data )
			.done( function( data ) {
				
				_log( data );
				
				if ( data.msg === 'true' ) {
					$.event.trigger( 'log', [ 'new item added' ] );
					$.event.trigger( 'newReset' );
				} else {
					$.event.trigger( 'log', [ data.msg ] );
				}
			})
			.fail( function() {
				
			});
	}
};

_v.views.newItem = {
	// node to append new html to
	$el : $( '#new' ),
	
	// validator data
	validator : null,
	
	init : function() {
		// init validator
		this.$el.bValidator();
		
		// cache validator for later use
		this.validator = this.$el.data('bValidator');
	},
	
	// views model for easy access
	model : _m.models.newItem,
	
	// global events for view -- built by _c.init()
	// key = event name, value = function name
	events : {
		'new' : 'new',
		'newShow' : 'show',
		'newReset' : 'reset'
	},
	
	// reset forms to empty
	reset : function() {
		this.$el.find( 'input' ).val( '' );
	},
	
	// check validation
	isValid : function() {
		return this.validator.validate();
	},
		
	// gets fresh batch of deals via ajax jsonp
	new : function( e ) {
		// local cache for data to be sent via ajax
		var data = {};
		
		// check validation
		if ( !this.isValid() ) {
			return;
		}
		
		this.$el.find( 'input' ).each( function() {
			var val = $( this ).val();
			
			// remove empty fields 
			if ( val === '' ) {
				return false;
			}
			
			// add to data obj
			data[ this.id ] = $( this ).val();
			
		});
		
		// _log( data );
		
		// send data map to model
		this.model.set( data )
			// attach extra handlers to modify view on response
			// this is the last set of done/fails called
			.done( function() {
				// do more stuff after render
			})
			.fail( function() {
				// do more stuff on ajax fail
			});
			
	},
	
	// toggle deals opacity between 1 and 0
	show : function() {
		_log( 'toggle' );
		this.$el
			.css( 'display', 'block' )
			.animate({
				opacity : 1
			}, 1000, function() {
				$.event.trigger( 'log', [ 'add a new item' ] );
			});
		return this;
	}
};


// extend events obj, event functions, and ready fn to _c
$.extend( _c, {
	// events to be set in _c.init
	// 'view delegateNode eventType modelToActOn' : 'functionName'
	// calls the functions with jQuery this, NOT _c this
	events : {
		'login #loginSubmit click login' : 'login',
		'newItem #newSubmit click newItem' : 'newItem'
		// 'login li click deal' : 'setDealIndex'
	},
	
	login : function( e, view ) {
		$.event.trigger( 'login' );
	},
	
	newItem : function() {
		$.event.trigger( 'new' );
	},
	
	// sets the index of the deal model
	// because this deals with the dom and calling to its model,
	// this = jQuery obj from delegate
	// setDealIndex : function( e, model ) {
	// 	// get index off node data-index attribute
	// 	var index = $( this ).attr( 'data-index' );
	// 	
	// 	// set this new index in the model
	// 	model.setIndex( index );
	// },
	
	// called after all events are bound by _c.init()
	ready : function() {
		_log( '_c.ready' );
		
		// everything is set up, now trigger actions to populate the page
		// $.event.trigger( 'getDeals' );
	}
	
});


$( function() {
	// starts the app
	// calls _m.init() - binds all handlers to views and controller
	// last action to fire _c.ready()
	_c.init();
});






