(function(){

	var class_name = 'Tournament';

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
    'ovner_uuid',
    'name',
    'date_created',
    'date_start',
    'parts'
	];

	App[ class_name ].schema =
	{
		uuid            : {type: 'string'},
    name      			: {type: 'string'},
    ovner_uuid      : {type: 'string'},
    date_created  	: {type: 'datetime'},
    date_start    	: {type: 'datetime'},
    parts    	      : {type: 'int'}
	}

})();
