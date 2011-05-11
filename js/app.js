// setup app info
_m.app = {
	name : 'ebay',
	version : '0.0.0',
	api : {
		deals : 'http://deals.ebay.com/feeds/jsonp'
	}
};

// init ajax hooks
_m.init = function() {
	
	$.ajaxSetup({
		appEvent : null,
		url : '',
		jsonp : 'cb',
		crossDomain : true,
		type : 'GET',
		dataType : 'jsonp'
	});
	
	// callback pre ajax settings extend
	// $( '#ajax' ).ajaxStart( function() {
	// 	_log( 'ajaxStart' );
	// });
	
	// callback fired right before ajax request is sent
	$( '#ajax' ).ajaxSend( function( e, jqxhr, settings ) {
	  	if ( settings.appEvent ) {
			_log( 'ajaxSend', settings.appEvent, 'Show Loader' );
			
			// possible switch for which loader to bring on for different types of loads
			// OR just one for all loads
			var self = $( this );
			self.css( 'display', 'block' );
			setTimeout( function() {
				self.removeClass( 'off' );
			}, 0 );
		}
	});
	
	// callback fired on ajax success -- global .done()
	$( '#ajax' ).ajaxSuccess( function( e, xhr, settings ) {
		if ( settings.appEvent ) {
			_log( 'ajaxSuccess', settings.appEvent, 'Hide Loader' );
			
			// ajax worked, remove the loader
			var self = $( this );
			self.addClass( 'off' )
				.one( 'webkitTransitionEnd', function() {
					self.css( 'display', 'none' );
				});
		}
	});
	
	// calllback fired on ajax error - global .fail()
	$( '#ajax' ).ajaxError( function( e, xhr, settings ){
		_log( arguments );
		_log( 'ajaxError', 'Ajax error: ' + settings.url + ' appEvent: ' + settings.appEvent || 'null' );
	});

	$.ajaxPrefilter( 'jsonp', function( o, originalOptions, jqXHR ) {
		// check to see if this ajax request came from core -- meaning it has a model reference
		if ( o.model && o.model.name ) {
			// o.model.name -  global event name
			// o.model.obj -  model obj
			
			switch( o.model.name ) {
			case 'deals' :
				o.url = _m.app.api.deals + o.url;
				_log( 'ajaxPrefilter', o.model.name );
				break;
			default :
				jqXHR.abort( 'bad appEvent' );
			}
			
			// extend eventName to options to be caught by ajaxHooks
			o.appEvent = o.model.name;
			
			// NOTE: 5/4/2011
			// set o.global = true specificaly in a prefilter for jsonp
			// to override line 7592 of jquery 1.6 --
			// this line checks if a request is crossDomain, if it is, global gets set to false
			// if global is set to false, ajaxHooks do NOT fire --
			// i dont know why they think this is a good idea,
			// but adding this here allows all ajaxHooks to fire
			o.global = true;
		}

	});

};

/************
 * DEALS
************/

// deals model
_m.models.deals = {
	// save to local storage or not on data refresh
	localStorage : true,
	
	// treat as array of objects or single object
	isCollection : true,
	
	// dependency
	dependency : {
		
		// name of dependee model
		'deal' : {
			target : null,
			index : 0
		}
		
	},
	
	// the deal view is dependent on this view ( deals )
	// this is the link that auto updates its dependee
	// anytime this models data is changed by a new ajax request
	dependee : 'deal',
	
	// set which index in its data array to assign to its dependency
	dependeeIndex : 0,
	
	// ajax'd data cached here
	data : null,
	
	// response data needs to be properly targed to the correct object
	targetData : function( data ) {
		return data.ebaydailydeals.items;
	},
	
	// gets fresh batch of deals via ajax jsonp
	get : function() {
		// returns ajax deferred -- add custom .done and .fail callbacks if desired
		// _m.getJsnop() will call the render of its view in its .done() automatically
		// NOTE: 'deals' param MUST be the name of its view/model
		return _m.ajax( 'deals', this )
			.done( function() {
				// do more stuff after render
				_log( 'model get done' );
			})
			.fail( function() {
				// do more stuff on ajax fail
			});
	}
	
};


// deals view
_v.views.deals = {
	// node to append new html to
	// $el : $( '#deals' ),
	$el : $( '<div id="deals" />' ),
	
	init : function() {
		this.$el.appendTo( 'body' );
	},
	
	// views model for easy access
	model : _m.models.deals,
	
	// global events for view -- built by _c.init()
	// key = event name, value = function name
	events : {
		'getDeals'    : 'get',
		'toggleDeals' : 'toggleDeals'
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
	toggleDeals : function( e ) {
		this.$el.toggleClass( 'off' );
	},
	
	// pushed ajax'd data from _m.getJsonp (on ajax done)
	render : function( data ) {
		var html = '<ul class="floated">';
		$.each( data, function( i, deal ) {
			html += '<li data-index="' + i + '">' +
						'<h2>' + deal.title + '</h2>' +
						'<div class="preload">' +
							'<img src=" ' + deal.smallpictureurl + '" alt="">' +
						'</div>' +
					'</li>';
		});
		html += '</ul>';
		
		this.$el.preHtml( html );
	}
};



/************
 * DEAL
************/
_m.models.deal = {
	// save to local storage or not on data refresh
	localStorage : false,
	
	// ajax'd data cached here
	data : null,
	
	// index of current deal in deals model
	dataIndex : null,
	
	// data is dependent on deals data
	dependent : 'deals',
	
	// set from _m.getJsonp -- it is dependent on other data, so we are setting it here
	set : function( data, index ) {
		// cache to model
		this.data = data;
		this.dataIndex = index;
		_v.views.deal.render( data );
	},
	
	// proxy to this.set - grabs index out of data dependency
	setIndex : function( index ) {
		// make sure index is a number
		index = parseInt( index, 10 );
		
		// if the user clicked on the last index, dont allow setting it
		if ( this.dataIndex !== index ) {
			
			// set the new data to proper data index from dependent
			this.set( _m.models[ this.dependent ].data[ index ] );
			
			// cache the current data index
			this.dataIndex = index;
		
		// user clicked on same index, do nothing
		} else {
			_log( 'user clicked on same deal, no change made' );
		}
	}
	
};

// deal view
_v.views.deal = {
	// node to append new html to
	$el : $( '#deal' ),
	
	// pushed ajax'd data from _m.getJsonp (on ajax done)
	render : function( data ) {
		var html = '';
		_log( 'deal render', data );
			html += '<h2>' + data.title + '</h2>' +
					'<h3>' + data.primarycategoryname + '</h3>' +
					'<div class="preload">' +
						'<img src=" ' + data.pictureurl + '" alt="">' +
					'</div>';
		
		this.$el.preHtml( html );
	}
};

// extend events obj, event functions, and ready fn to _c
$.extend( _c, {
	// events to be set in _c.init
	// 'view delegateNode eventType modelToActOn' : 'functionName'
	// calls the functions with jQuery this, NOT _c this
	events : {
		'deals li click deal' : 'setDealIndex'
	},
	
	// sets the index of the deal model
	// because this deals with the dom and calling to its model,
	// this = jQuery obj from delegate
	setDealIndex : function( e, model ) {
		// get index off node data-index attribute
		var index = $( this ).attr( 'data-index' );
		
		// set this new index in the model
		model.setIndex( index );
	},
	
	// called after all events are bound by _c.init()
	ready : function() {
		_log( '_c.ready' );
		
		// everything is set up, now trigger actions to populate the page
		$.event.trigger( 'getDeals' );
	}
	
});


$( function() {
	// starts the app
	// calls _m.init() - binds all handlers to views and controller
	// last action to fire _c.ready()
	_c.init();
});






