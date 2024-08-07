(function( this_or_window ){

	var is_nodejs = false;
	if( typeof exports != 'undefined' )
	{
		is_nodejs = true;
	}

	var App = {};
	if( is_nodejs )
	{
		App = this_or_window;
	}
	else
	{
		this_or_window.App = App;
	}

	App.log_level = 3;

	// forward to console.log
	var log = function( args )
	{
		switch( args.length ) // webkit won't let us use console.log.apply, this is a hacky workaround
		{
			case 1: console.log( args[0] ); 						   break;
			case 2: console.log( args[0], args[1] ); 				   break;
			case 3: console.log( args[0], args[1], args[2] ); 		   break;
			case 4: console.log( args[0], args[1], args[2], args[3] ); break;
			default: console.log( args ); break;
		}
	}

	App.log = function()
	{
		if( App.log_level >= 1 )
		{
			log( arguments ); // forward to console.log
		}
	};

	App.debug = function()
	{
		if( App.log_level >= 2 )
		{
			log( arguments ); // forward to console.log
		}
	};


	/**
	 * known classes
	 */
	App.classes = {};

	/**
	 * registration handlers
	 */
	App.registration_handlers = {};

	App.on_register = function( class_name, callback )
	{
		if( App[ class_name ] )
		{
			callback();
		}
		else
		{
			if( !App.registration_handlers[ class_name ] )
			{
				App.registration_handlers[ class_name ] = [];
			}
			App.registration_handlers[ class_name ].push( callback );
		}
	};

	/**
	 * registers new class and attaches event functionality
	 */
	App.register = function( class_name, url, after, parent )
	{
		App[ class_name ] = App[ class_name ] || function(){};

		parent = parent || App.Base;

		App[ class_name ].prototype = new parent();
		App.classes[ class_name ] = url || null;

		// copy base classes' class-wide methods
		for( var i in parent )
		{
			if( typeof parent[i] == 'function' )
			{
				App[ class_name ][i] = parent[i];
			}
		}

		// store class name
		//App[ class_name ].class_name = class_name;
		App[ class_name ].prototype.class_name = class_name;

		var modification_handler = function()
		{
			this.mark_as_unsynced();
			this.mutated_at = new Date().getTime();

			var key = 'unsynced';

			App.db.persist( key, App.db.unsynced_filter );
			App.db.sync( key, App.db.unsynced_filter );
		}

		// bind modification event handler //
		App[ class_name ].on( 'modify',     modification_handler );
		App[ class_name ].on( 'obliterate', modification_handler );

		// execute registration callbacks
		if( App.registration_handlers[ class_name ] )
		{
			setTimeout(function() // this is required for class definition to fully execute
			{
				App.registration_handlers[ class_name ].foreach(function( item )
				{
					item();
				});
			}, 0);
		}
	};

	/**
	 * controller namespaces
	 */
	App.controllers = {};

})( this );

// fix less-than-ideal decision by standards committee :)
Array.prototype.foreach = Array.prototype.forEach;
