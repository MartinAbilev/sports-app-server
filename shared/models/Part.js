(function(){

	var class_name = 'Part';

	App[ class_name ] = function()
	{
		App.Base.apply( this, arguments );
	}

	App.register( class_name, true );

	/**
	 * class properties - these will be read from and updated back to server
	 */

	App[ class_name ].prototype.properties =
	[
		'uuid',
    'tournament_uuid',
    'name',
    'positon',
    'date_created',
    'date_start'
	];

	App[ class_name ].schema =
	{
		uuid            : {type: 'string'},
    tournament_uuid : {type: 'string'},
    name            : {type: 'string'},
    positon         : {type: 'int'},
    date_created  	: {type: 'datetime'},
    date_start  	  : {type: 'datetime'}
	}

})();
