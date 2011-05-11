// uMVC core
// Chris Kihneman
// v0.0.2
//
// General Concept
// _m : model (data) handler -- mainly localStorage and ajax
// _v : views to be updated when new data comes in from _m
// _c : controller -- links user interaction to get proper data from _m to change a view in _v


// model obj
window._m = {
	// all models will be held here
	models : {},
	
	// localStorage handler
	ls : {
		// get string from local storage, and caches it to _u
		// set isUserVar to false to return the value and not save to _u
		get : function( name, isUserVar ) {
			var value, self = localStorage[ _m.app.name + '_' + name ],
				isObj = self.substr( 0, 1 ) === '{' ? true : false;
			isUserVar = isUserVar || true;
			value = isObj ? JSON.parse( self ) : self;
			if ( isObj ) {
				for ( var i in value ) {
					if ( i === 'isArray' ) {
						value = value[ i ];
					}
					break;
				}
			}
			// if ( isUserVar ) {
			// 	_user[ name ] = value;
			// 	return true;
			// } else {
				return value;
			// }
			_log( '_ls.get', 'done', name );
		},

		// set string, json object, or array to localStorage
		// automatically caches to _u
		// set isUserVar to false to return the value and not save to _u
		set : function( name, value, isUserVar ) {
			isUserVar = isUserVar || true;
			// if ( isUserVar ) {
			// 	_user[ name ] = value;
			// }
			if ( value.constructor === Array ) {
				value = { 'isArray' : value }
			}
			localStorage[ _m.app.name + '_' + name ] = ( typeof value === 'object' ) ? JSON.stringify( value ) : value;
			_log( '_ls.get', 'done', name );
		}
	},
	
	// ajax - gets data
	// @name ( string ) - name of model to get fresh data for
	// @model ( object ) - model obj that is getting new data
	ajax : function( name, model, dataMap ) {
		// cache reference to _m
		var gThis = this;
		
		_log( '_m.ajax', 'INIT', name );
		
		return $.ajax({
			// assign model to ajax options
			// - used in ajaxPrefilter
			model : {
				name : name || false,
				obj : model || {}
			},
			
			// set data to be sent in request
			data : dataMap || null
			
		}).done( function( data ) {

			_log( '_m.get', 'DONE', name, model, this );
			
			// re-target data to proper place in response obj
			if ( model.targetData ) {
				data = model.targetData( data );
			}
			
			// bool to check if data should be cached here to model
			if ( !model.isDataWait ) {
				// cache data
				model.data = data;
			}
			
			// bool to wait for your own render call
			if ( !model.isRenderWait ) {
				// render its view now that we have the data
				_v.views[ name ].render( model.data );
			}
			
			// check for dependencies
			if ( model.dependency ) {
				
				// set dependency data
				gThis.setDependees( model );
				
			}
			
			// check if it should be saved to localStorage as well
			if ( model.localStorage ) {
				_m.ls.set( name, model.data );
			}

		}).fail( function() {
			
			_log( 'master fail', arguments );
			
		});
	},
	
	// recurse thru all dependees, setting each on they way
	// this set on the model will in turn render its view
	setDependees : function( model ) {
		var gThis = this;
		
		_log( ( model.dependency || 'no' ) + ' DEPENDEE found' );
		
		// check to make sure current model has a dependee
		if ( model.dependency ) {
			
			// loop through all dependencies
			$.each( model.dependency, function( dependeeName, dependeeData ) {
				var dependee, data, target, index;
				
				// get dependee now that we know it exists on the model
				dependee = gThis.models[ dependeeName ];

				// num - try to get data index, if not set, default to 0
				index = dependeeData.index || 0;

				// get data to be set on dependee model
				data = model.data[ index ];

				// check to make sure data we are about to set exists
				if ( data && dependee.set ) {
					_log( 'dependee set' );

					// pass the dependee model the data and index to be set,
					// will render its view in the set
					dependee.set( data, index );

					// recurse down to next dependee
					gThis.setDependees.call( gThis, dependee );

				}
				
			});
			
		}
	}
	
};


// view obj
window._v = {
	// add all views here
	views : {}
};


// controller obj
window._c = {
	// controller init all view events
	init : function() {
		// cache reference to _c
		var gThis = this;
		
		// loop through all views
		$.each( _v.views, function( name, view ) {
			
			// check to see if view has init
			if ( view.init ) {
				view.init.call( view );
			}
			
			// be sure the view has events to be bound
			if ( view.events ) {
				
				// loop thorugh all events in each view
				$.each( view.events, function( event, fn ) {
					event = event.split( ' ' );
					
					if ( event.length === 2 ) {
						event = {
							type : event[ 1 ],
							$el : $( event[ 0 ] )
						}
					} else {
						event = {
							type : event[ 0 ],
							$el : view.$el
						}
					}
					
					// bind event to view element with given function
					event.$el.bind( event.type, function( e ) {

						_log( 'FIRE', event, fn );
					
						// call view event function
						view[ fn ].call( view, e );

					});
				
					_log( 'BIND', event, fn );
				
				});
			}

		});
		
		// loop thorugh all controller events
		// @params (string) - 'view delegateNode eventType'
		$.each( this.events, function( params, fn ) {
			// split modelElmString into model and element to delegate to strings
			var $viewElm, mvName, delegateNode, eventType, modelToActOn,
				paramsArray = params.split( ' ' );
			
			// model and view string name
			mvName = paramsArray[ 0 ];
			
			// view node to delegate on
			$viewElm = _v.views[ mvName ].$el;
			
			// delegate to this node in the context of $viewElm
			delegateNode = paramsArray[ 1 ];
			
			// event type for this delegate
			eventType = paramsArray[ 2 ];
			
			// model to call on delegate function
			modelToActOn = paramsArray[ 3 ];
			
			// delegate function to elements
			$viewElm.delegate( delegateNode, eventType, function( e ) {
				
				_log( 'FIRE', params, fn );
				
				// call controller fn with jQuery this
				gThis[ fn ].call( this, e, _m.models[ modelToActOn ] );
				
			});
			
			_log( 'BIND', params, fn );
			
		});
		
		// set up ajax hooks
		_m.init();

		// after all events are bound, do something else if you want...
		this.ready();
	}
};






















