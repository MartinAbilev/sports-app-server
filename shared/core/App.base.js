(function(){

	/**
	 * This is a base class - do not instantiate it directly
	 *
	 * common events: // TODO: document these
	 *   - mutate
	 *   - modify
	 *   - destroy
	 *   - obliterate
	 *   - synced
	 *   - load
	 */
	var class_name = 'Base';

	/*
	 * constructor
	 */
	App[ class_name ] = function( values )
	{
		var self = this;

		// add empty values
		for( var i = 0; i < self.properties.length; i++ )
		{
			var name = self.properties[i];
			if( !( name in self ) )
			{
				self[ name ] = null;
			}
		}

		if( values !== undefined )
		{
			for( var name in values )
			{
				var value = values[ name ];

				if( self.properties.indexOf( name ) !== -1 )
				{
					self[ name ] = value;
				}
			}
		}

		// generate uuid
		if( self.properties.indexOf( 'uuid' ) !== -1 && !self.uuid )
		{
			self.id = self.uuid = UUID.generate();
		}
		// store ip
		if( self.properties.indexOf( 'author_ip' ) !== -1 && App.client_ip && !self.author_ip )
		{
			self.author_ip = App.client_ip;
		}
		// fill-in constructed_at
		if( self.properties.indexOf( 'constructed_at' ) !== -1 )
		{
			var date = new Date();
			self.constructed_at = App.utils.date();
			self.constructed_at_miliseconds = date.getTime();
		}

		// default synced value for new objects is false
		if( self.synced === undefined && ( !values || values.synced === undefined ) )
		{
			self.synced = false;
		}

		self.initialized_at = new Date().getTime();
		self.change_timestamps = {};
		self.previous_values = {};
		self.set_baseline();
		self.properties.foreach(function( property )
		{
			self.change_timestamps[ property ] = new Date().getTime();
			self.previous_values[ property ] = undefined;
		});

		return self;
	}

	/********** class level mehods **********/

	/**
	 * class_name()
	 */
	App[ class_name ].class_name = function()
	{
		for( var i in App )
		{
			if( this === App[i] )
			{
				return i;
			}
		}
		return 'Base';
	};

	/**
	 * on()
	 */
	App[ class_name ].on = function( type, handler )
	{
		if( !this.events )
		{
			this.events = {};
		}
		if( !(type in this.events) )
		{
			this.events[ type ] = [];
		}
		this.events[ type ].push( handler );
	};

	/**
	 * trigger()
	 */
	App[ class_name ].trigger = function( type, args )
	{
		if( this.events[type] )
		{
			for( var i = 0; i < this.events[type].length; i++ )
			{
				this.events[type][i].apply( this, args || [] );
			}
		}
	};

	/*
	 * find()
	 */
	App[ class_name ].find = function( id_or_finder )
	{
		if( typeof id_or_finder == 'function' )
		{
			return App.db.first( this.class_name(), id_or_finder );
		}
		return App.db.retrieve( this.class_name(), id_or_finder );
	};

	/*
	 * create_or_update()
	 */
	App[ class_name ].create_or_update = function( id, values )
	{
		var instance = App[ this.class_name() ].find( id );
		var instance_exists = !!instance;
		if( !instance_exists )
		{
			instance = new App[ this.class_name() ]();
			instance.id = instance.uuid = id;
			App.db.insert( this.class_name(), instance );
		}
		if( values )
		{
			for( var name in values )
			{
				var value = values[ name ];
				if( instance.properties.indexOf( name ) !== -1 )
				{
					instance[ name ] = value;
				}
			}
		}
		return instance;
	};

	/*
	 * all()
	 */
	App[ class_name ].all = function( condition, include_deleted )
	{
		condition = condition || function(){ return true };
		return App.u.toArray( App.db.collect( this.class_name(), condition, include_deleted ) );
	};

	/*
	 * log()
	 */
	App[ class_name ].log = function( message )
	{
		//console.log( '\033[36m[' + App.u.date() + '] \033[32m' + this.class_name() + ':\033[39m ' + message );
	};

	/********** instance level mehods **********/

	App[ class_name ].prototype.class_name = class_name;

	App[ class_name ].prototype.synced = false;

	App[ class_name ].prototype.initialized_at = null;

	App[ class_name ].prototype.mutated_at = 0;

	/**
	 * class properties - these will be read from and updated back to server
	 */
	App[ class_name ].prototype.properties = [];

	/**
	 * to_post_data()
	 *
	 * returns an object containing only saveable properties
	 */
	App[ class_name ].prototype.to_post_data = function( since )
	{
		var self = this;
		var values = {};
		var changes = self.changes( since );
		for( var i in changes )
		{
			values[i] = self[i];
		}
		if( !('uuid' in values) && this.uuid )
		{
			values.uuid = this.uuid;
		}
		if( this.deleted )
		{
			values.deleted = this.deleted;
		}
		return values;
	}

	/**
	 * mark_as_synced()
	 */
	App[ class_name ].prototype.mark_as_synced = function()
	{
		this.synced = true;
		this.trigger( 'synced' );
	}

	/**
	 * mark_as_unsynced()
	 */
	App[ class_name ].prototype.mark_as_unsynced = function()
	{
		this.synced = false;
	}

	/**
	 * destroy()
	 */
	App[ class_name ].prototype.destroy = function()
	{
		this.deleted = true;
		// reflect changes to the dom
		this.trigger( 'destroy' );
		// and to the database
		this.trigger( 'obliterate' );
	}


	/*
	 * insert()
	 */
	App[ class_name ].prototype.insert = function()
	{
		App.db.insert( this.class_name, this );
	}

	/**
	 * on()
	 *
	 * this is an override for class-level App[ class_name ].on() method
	 */
	App[ class_name ].prototype.on = function( type, handler )
	{
		if( !this.events )
		{
			this.events = {};
		}
		if( !this.events[ type ] )
		{
			this.events[ type ] = [];
		}
		if( typeof handler == 'function' )
		{
			this.events[ type ].push( handler );
		}
	};

	/**
	 * once()
	 *
	 * this is an override for class-level App[ class_name ].once() method
	 */
	App[ class_name ].prototype.once = function( type, handler )
	{
		if( !this.one_time_events )
		{
			this.one_time_events = {};
		}
		if( !this.one_time_events[ type ] )
		{
			this.one_time_events[ type ] = [];
		}
		if( typeof handler == 'function' )
		{
			this.one_time_events[ type ].push( handler );
		}
	};

	/**
	 * trigger()
	 */
	App[ class_name ].prototype.trigger = function( type, args )
	{
		// first trigger instance-specific handlers
		if( this.events && this.events[type] )
		{
			for( var i = 0; i < this.events[type].length; i++ )
			{
				this.events[type][i].apply( this, args );
			}
		}
		// after those trigger one-time instance-specific handlers and clear them out
		if( this.one_time_events && this.one_time_events[type] )
		{
			for( var i = 0; i < this.one_time_events[type].length; i++ )
			{
				this.one_time_events[type][i].apply( this, args );
			}
			this.one_time_events[type] = [];
		}
		// then class wide handlers
		var instanceClassName;
		for( var j in App.classes )
		{
			instanceClassName = j;
			if( this instanceof App[ instanceClassName ] && App[ instanceClassName ].events && App[ instanceClassName ].events[type] )
			{
				for( var i = 0; i < App[ instanceClassName ].events[type].length; i++ )
				{
					App[ instanceClassName ].events[type][i].apply( this, args || [] );
				}
				break;
			}
		}
		if( type == 'mutate' )
		{
			this.update_change_timestamps();
			this.set_baseline();
		}
	};

	/**
	 * trigger_modification()
	 */
	App[ class_name ].prototype.trigger_modification = function( changed_property )
	{
		// reflect changes to the dom
		this.trigger( 'mutate', [ changed_property ] );
		// and to the database
		this.trigger( 'modify', [ changed_property ] );
	};

	/**
	 * set()
	 */
	App[ class_name ].prototype.set = function( name, value )
	{
		//if( this[ name ] !== value )
		//{
			this[ name ] = value;
			this.trigger_modification( name );
		//}
	};

	/**
	 * toggle()
	 */
	App[ class_name ].prototype.toggle = function( property )
	{
		this.set( property, !this[ property ] );
	}

	/*
	 * set_baseline()
	 */
	App[ class_name ].prototype.set_baseline = function()
	{
		var self = this;
		self.baseline_values = {};
		self.properties.foreach(function( name )
		{
			self.baseline_values[ name ] = self[ name ];
		});
	};

	/*
	 * get_baseline()
	 */
	App[ class_name ].prototype.get_baseline = function()
	{
		var self = this;
		if( self.baseline_values )
		{
			return self.baseline_values;
		}
		return null;
	};

	/*
	 * changes()
	 *
	 * return hash with changes - by default since last mutation event, but optionally after a timestamp
	 */
	App[ class_name ].prototype.changes = function( since )
	{
		var self = this;
		var changes = {};
		// avoid property and method collisions
		var properties = [];
		self.properties.foreach(function( property )
		{
			if( typeof self[ property ] != 'function' )
			{
				properties.push( property );
			}
			else
			{
				console.warn( 'WARNING: ' + self.class_name + ' has property collision: ' + property );
			}
		});
		if( since === undefined )
		{
			var compared_to = self.get_baseline();
			if( compared_to )
			{
				properties.foreach(function( property )
				{
					if( compared_to[ property ] !== self[ property ] )
					{
						changes[ property ] = { from: compared_to[ property ], to: self[ property ] };
					}
				});
			}
		}
		else
		{
			var change_timestamps = self.change_timestamps || {};
			properties.foreach(function( property )
			{
				if( change_timestamps[ property ] && change_timestamps[ property ] > since )
				{
					changes[ property ] = { from: self.previous_values[ property ], to: self[ property ] };
				}
			});
		}
		return changes;
	};

	/*
	 * update_change_timestamps()
	 */
	App[ class_name ].prototype.update_change_timestamps = function()
	{
		var self = this;
		if( !self.change_timestamps )
		{
			self.change_timestamps = {};
		}
		if( !self.previous_values )
		{
			self.previous_values = {};
		}
		var changes = self.changes();
		for( var property in changes )
		{
			self.change_timestamps[ property ] = new Date().getTime();
			self.previous_values[ property ] = changes[ property ].from;
		}
	};

	/*
	 * log_name()
	 */
	App[ class_name ].prototype.log_name = function()
	{
		return this.class_name;
	};

	/*
	 * log()
	 */
	App[ class_name ].prototype.log = function( message )
	{
		//console.trace();
		//console.log( '\033[36m[' + App.u.date() + '] \033[32m' + this.log_name() + ':\033[39m ' + message );
	};


})();
