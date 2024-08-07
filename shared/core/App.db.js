App.db =
{
	/**
	 * private variable where data is stored
	 * DO NOT use this directly
	 */

	connect_db: function( callback )
	{
		var callback = callback || function (){};

		App.db.pool.getConnection(function(err, connection)
		{
			if (err)
			{
				console.error( 'DB error connecting: ' + err.stack );
				return;
			}

			console.log( 'DB connected ' );
			callback();
			connection.release();
		});
	},

	storage: {},
	/**
	 * timestamp to filter out newer objects
	 */
	older_than: null,
	/**
	 * stack where previous older_than values are stored
	 */
	older_than_stack: [],
	/**
	 * set older_than
	 */
	set_older_than: function( new_value )
	{
		App.db.older_than_stack.push( App.db.older_than );
		App.db.older_than = new_value;
	},
	/**
	 * restore older_than to previous value
	 */
	restore_older_than: function()
	{
		App.db.older_than = App.db.older_than_stack.pop() || null;
	},
	/**
	 * inserts an object in store
	 */
	insert: function( className, object, key )
	{
		if( key === undefined )
		{
			key = object.uuid || object.id;
		}
		if( App.db.storage[ className ] === undefined )
		{
			App.db.storage[ className ] = {};
		}
		App.db.storage[ className ][ key ] = object;
		return true;
	},
	/**
	 * retrieve an object from store by id
	 */
	retrieve: function( className, key )
	{
		var store = App.db.storage;
		if( store[ className ] && store[ className ][ key ] )
		{
			return store[ className ][ key ];
		}
		return null;
	},
	/**
	 * load a batch of objects
	 */
	load: function( data )
	{
		var instances = [], deleted = [];
		for( var class_name in data )
		{
			var store = data[ class_name ];
			for( var i in store )
			{
				var values = store[ i ] || {};
				if( typeof values != 'function' )
				{
					var id = values.uuid || values.id;
					values.id = id;
					if( typeof App[ class_name ] == 'function' )
					{
						// detect deletion
						var existing = App.db.retrieve( class_name, id );
						if( existing )
						{
							if ( !existing.deleted && values.deleted )
							{
								deleted.push( existing );
							}
							else if ( 'delta' in values )
							{
								values = values.delta;
							}
						}
						var instance = App[ class_name ].create_or_update( id, values );
						instances.push( instance );
					}
					else if( class_name != 'source_token' )
					{
						console.error( 'App.' + class_name + ' not loaded' );
					}
				}
			}
		}
		// trigger load events
		instances.foreach(function( instance )
		{
			instance.trigger( 'beforeload' );
			instance.trigger( 'load' );
		});
		// trigger destroy events
		deleted.foreach(function( instance )
		{
			instance.trigger( 'destroy' );
		});
		return instances;
	},
	/**
	 * destroy object
	 */
	destroy: function( className, key )
	{
		if( App.db.storage[ className ] === undefined )
		{
			App.db.storage[ className ] = {};
		}
		delete App.db.storage[ className ][ key ];
		return true;
	},
	/**
	 * collect objects
	 */
	collect: function( className, callback, include_deleted )
	{
		var collection = {};
		var store = App.db.storage;
		var callback = callback || App.db.unsynced_filter;

		if( store[ className ] === undefined )
		{
			store[ className ] = {};
		}
		for( var key in store[ className ] )
		{
			var item = store[ className ][ key ];
			if
			(
				( include_deleted || !item.deleted )
				&&
				( !App.db.older_than || !item.constructed_at_miliseconds || item.constructed_at_miliseconds <= App.db.older_than )
				&&
				callback( item )
			)
			{
				collection[ key ] = item;
			}
		}
		return collection;
	},
	/**
	 * return first object that satisfies callback
	 */
	first: function( className, callback, include_deleted )
	{
		var store = App.db.storage;
		if( store[ className ] === undefined )
		{
			store[ className ] = {};
		}
		for( var key in store[ className ] )
		{
			var item = store[ className ][ key ];
			if
			(
				( !item.deleted || include_deleted )
				&&
				( !item.constructed_at_miliseconds || !App.db.older_than || item.constructed_at_miliseconds <= App.db.older_than )
				&&
				callback( item )
			)
			{
				return item;
			}
		}
		return null;
	},
	/**
	 * dumps all storage to localStorage
	 */
	 persist: function( callback )
	 {
	 	var storage = App.db.storage;

	 	var counter = 0;
	 	var items = 0;

	 	callback = callback || function(){};

		for( key in storage )
		{
			console.log('STORAGE KEYS', key);
		}

		App.db.pool.getConnection(function(err, connection)
		{

			for( var storage_key in storage )
			{
		 		var classes = storage[storage_key];

		 		for( var class_key in classes )
		 		{
		 			var entry = classes[class_key];

		 			var post  = {};

		 			for( var schema_key in App[storage_key].schema )
		 			{
		 				post[schema_key] = entry[schema_key];
		 			}

					//dev.mysql.com/doc/refman/5.0/en/replace.html
					//replace will only replace if ANY of the fields you're
					//using are the primary or at least a unique key in the table.
					//since none of your fields are, it simply does an insert

						connection.config.queryFormat = undefined;

						items ++;
						console.log('STORAGE KEYS BEFORE QUERY',  storage_key.toLowerCase());
						var query = connection.query( 'REPLACE INTO ' + storage_key.toLowerCase() + ' SET ?', post, function( err, result )
						{
							console.log( query.sql );
							console.log( 'SQL RETURN',err, result )
							counter ++;

							//console.log( 'SQL RETURN', result, counter, items )
							if( counter >= items )// if all items stored fire callback
							{
								callback( err );
								connection.release();
							}
							
						});
						//console.log( query.sql );

		 		}



				}

			});

	 },
	/**
	 * set new values
	 */
	set: function( object, values, callback )
	{
		var post = values;
		var uuid = object.uuid;

		var callback = callback || function(){};

		var class_name = object.class_name.toLowerCase();
		App.db.pool.getConnection(function(err, connection)
		{
			connection.config.queryFormat = undefined;
			var query = connection.query( 'UPDATE ' + class_name + ' SET ? WHERE uuid = "' + uuid + '" ', post, function( err, result )
			{
				//console.log( 'SQL RETURN',err, result );
				callback( err, result );
				//console.log( query.sql );
				connection.release();
			});
		});
	},
	/**
	 * delete from db
	 */
	 delete: function( object, values, callback )
	 {
		 var post = values;

		 var callback = callback || function(){};

		 var class_name = object.toLowerCase();
		 if( object.class_name )
		 {
			 class_name = object.class_name.toLowerCase();
		 }

		 App.db.pool.getConnection(function(err, connection)
		 {
			 if( connection )
			 {
				 connection.config.queryFormat = undefined;
				 var query = connection.query( 'DELETE FROM ' + class_name + ' WHERE ?', post, function( err, result )
				 {
					 callback( err, result );
					 console.log( query.sql );
					 connection.release();
				 });
			 }
		 });
	 },
	/**
	 * select from db
	 */
	select: function( class_name, key, callback, limit )
	{
		var callback = callback || function(){};
		//var limit = limit || 1;

		App.db.pool.getConnection(function(err, connection)
		{
			class_name = class_name.toLowerCase();
			var sql = null;
			if( typeof key == 'string' )
			{
				sql = "SELECT * FROM ?? WHERE " + key;
			}
			else if( key )
			{
				sql = "SELECT * FROM ?? WHERE ?";
				// if( limit > 1 )
				// {
				// 	sql = "SELECT uuid, client_id, date_requested, date_created, report_type, params, is_finished, is_deleted, SUBSTRING( raw_report, 5, 10 ) FROM ?? WHERE ?";
				// }
			}
			else
			{
				sql = "SELECT * FROM ??";
				// if( limit > 1 )
				// {
				// 	sql = "SELECT uuid, client_id, date_requested, date_created, report_type, params, is_finished, is_deleted, SUBSTRING( raw_report, 5, 10 ) FROM ??";
				// }
			}

			if( limit )
			{
				sql += " ORDER BY date_requested DESC LIMIT " + limit;
			}
			else
			{
				sql += " ORDER BY date_created";
			}
			var inserts = [ class_name ];
			var post = key;

			connection.config.queryFormat = function (query, values)
			{
				if (!values) return query;

				var qstr = query.replace('?', function (txt, key)
				{
					var str = this.escape(values).replace(/,/g, ' AND');
			    return str;
			  }.bind(this));

				return qstr;
			};

			sql = App.mysql.format(sql, inserts);

			console.log('SELECT', post );

			var query = connection.query( sql, post, function(err, results)
			{
		  	//console.log( 'SQL SELECT', err, results );
				// And done with the connection.
				console.log(query.sql);
    		connection.release();
				callback( { error: err, results: results, query: query.sql } );
			});
		});

	},

	/**
	 * restores storage from localStorage
	 */
	restore: function( key, filter )
	{

	},
	/**
	 * post uncynced objects to server
	 */
	sync: function( key, filter )
	{

	},
	/**
	 * clear synched objects from memory
	 */
	purge: function()
	{

	},
	/**
	 * method to filter unsynced objects
	 */
	unsynced_filter: function( item )
	{
		return !item.synced && App.classes[ item.class_name ];
	}
}
