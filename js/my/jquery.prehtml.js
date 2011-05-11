$.fn.preHtml = function( html, options ) {
	
	var o = $.extend( {}, $.fn.preHtml.defaults, options ),
		$html = $( html ),
		$nodes = $html.find( '.' + o.class );
			
	$nodes.each( function() {
		
		var $loader, $node = $( this ),
			$image = $node.find( 'img' ),
			image = $image[ 0 ];
		
		if ( $image[ 0 ].complete ) {
			$image.removeClass( 'off' );
		} else {
			$loader = $( $.fn.preHtml.styles[ o.style ] );
			$node.append( $loader );
			$image.addClass( 'off' );
			$image.one( 'load', function() {
				$image.removeClass( 'off' );
				$loader.addClass( 'off' );
			});
			$image.one( 'webkitAnimationEnd webkitTransitionEnd', function() {
				$loader.remove();
			});
		}
		
	});
	
	return this.empty().append( $html );
	
};

$.fn.preHtml.defaults = {
	class : 'preload',
	style : 'circular'
};

$.fn.preHtml.styles = {
	circular : '<div class="loaderWrap">' +
			'<div class="loader opacity">' +
				'<div class="circular circular_1"></div>' +
				'<div class="circular circular_2"></div>' +
				'<div class="circular circular_3"></div>' +
				'<div class="circular circular_4"></div>' +
				'<div class="circular circular_5"></div>' +
				'<div class="circular circular_6"></div>' +
				'<div class="circular circular_7"></div>' +
				'<div class="circular circular_8"></div>' +
			'</div>' +
		'</div>'
};