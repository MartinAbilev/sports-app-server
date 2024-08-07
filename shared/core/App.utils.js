App.utils =
{
	/**
	 * numbers
	 */
	thousands: function( number, separator )
	{
		var expression = new RegExp('(-?[0-9]+)([0-9]{3})');
		var separated = App.utils.cleanup( number ) + '';

		if( separator === undefined )
		{
			separator = ' ';
		}
		while( expression.test( separated ) )
		{
			separated = separated.replace( expression, '$1' + separator + '$2' );
		}
		return separated;
	},
	cleanup: function( number )
	{
		if( number === null )
		{
			return 0;
		}
		number += '';
		number = number.replace( / /gi, '' );
		number = number.replace( /,/i, '.' );
		if( isNaN( number ) )
		{
			return 0;
		}
		return number * 1;
	},
	format: function( number, precision, separator )
	{
		number = App.utils.cleanup( number );
		if( precision === undefined )
		{
			precision = 2;
		}
		if( precision === false )
		{
			return App.utils.thousands( number, separator );
		}
		else
		{
			return App.utils.thousands( number.toFixed( precision ), separator );
		}
	},
	/**
	 * postfix big number with K or M
	 */
	shorten: function( number, round, separator )
	{
		number = App.u.cleanup( number );
		var text = App.u.format( number, 0, separator );
		if( round )
		{
			if( number >= 1000000 )
			{
				number = Math.round( number / 100000 ) * 100000;
			}
			else if( number >= 10000 )
			{
				number = Math.round( number / 1000 ) * 1000;
			}
		}
		if( number >= 1000000 )
		{
			text = number / 1000000 + ' M';
		}
		else if( number >= 10000 )
		{
			text = number / 1000 + ' K';
		}
		return text;
	},
	/*
	 * shorten all numbers to a common scale
	 *
	 * all numbers must exceed or equal scale and at least one must exceed scale by
	 * an order of magnitude
	 */
	shorten_all: function( numbers, round, separator )
	{
		var scale = null;
		var treshold_scale = 0;
		var texts = [];
		numbers.foreach(function( number )
		{
			number = App.u.cleanup( number );
			var this_scale = 0;
			if( number >= 1000000 ) 	// 1 million
			{
				this_scale = 1000000; 	// 1 million
			}
			else if( number >= 1000 ) 	// 1 thousand
			{
				this_scale = 1000; 		// 1 thousand
			}
			if( scale === null )
			{
				scale = this_scale;
			}
			var this_treshold_scale = 0;
			if( number >= 10000000 ) 			// 10 million
			{
				this_treshold_scale = 1000000; 	// 1 million
			}
			else if( number >= 10000 ) 			// 10 thousand
			{
				this_treshold_scale = 1000; 	// 1 thousand
			}
			scale = Math.min( scale, this_scale );
			treshold_scale = Math.max( treshold_scale, this_treshold_scale );
		});

		scale = Math.min( scale, treshold_scale );

		numbers.foreach(function( number )
		{
			number = App.u.cleanup( number );
			var text = App.u.format( number, 0, separator );
			if( round )
			{
				number = Math.round( number / scale ) * scale;
			}
			if( scale == 1000000 ) // 1 million
			{
				text = App.u.format( number / scale, 0, separator ) + ' M';
			}
			else if( scale == 1000 ) // 1 thousand
			{
				text = App.u.format( number / scale, 0, separator ) + ' K';
			}
			texts.push( text );
		});
		return texts;
	},
	to_array: function( object )
	{
		if( object instanceof Array )
		{
			return object;
		}
		var array = [];
		for( var i in object )
		{
			array.push( object[i] );
		}
		return array;
	},
	/**
	 * return formatted date
	 *
	 * supported placeholders: 'Y', 'm', 'd', 'H', 'i', 's'
	 */
	date: function( format, date )
	{
		format = format || 'Y-m-d H:i:s';

		var is_numeric = function (obj)
		{
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		}

		if( is_numeric( date ) )
		{
			date = new Date( date );
		}
		if( date instanceof Date == false )
		{
			date = new Date();
		}

		var replacements =
		{
			Y: date.getFullYear(),
			m: date.getMonth() + 1,
			d: date.getDate(),
			H: date.getHours(),
			i: date.getMinutes(),
			s: date.getSeconds()
		};

		for( var i in replacements )
		{
			// pad with zeros
			replacements[i] += '';
			if( replacements[i].length == 1 )
			{
				replacements[i] = '0' + replacements[i];
			}
			// replace
			format = format.replace( new RegExp( i ), replacements[i] );
		}
		return format;
	},
	format_date_utc: function( format, date )
	{
		if ( Number( date ) )
		{
			date = new Date(date);
		}
		// change date to match UTC time
		date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

		return App.utils.date( format, date );
	},
	ordinalize: function( n )
	{
		var s = ["th","st","nd","rd"];
		return n + ( s[(n%100-20)%10] || s[n%100] || s[0] );
	},

	date_now: function()
	{
		return this.format_date_utc( 'Y-m-d H:i:s', Date.now() );
	}
}

App.u = App.utils;
App.u.toArray = App.u.to_array;
