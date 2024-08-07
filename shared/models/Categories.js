(function(){

	var class_name = 'Categories';

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
    'date_created',
    'categorie',
    'from',
    'to'
	];

	App[ class_name ].schema =
	{
		uuid                 : {type: 'string'},
    tournament_uuid      : {type: 'string'},
    date_created  	     : {type: 'datetime'},
    categorie    	       : {type: 'string'},
    from    	           : {type: 'int'},
    to    	             : {type: 'int'}
	}

})();
