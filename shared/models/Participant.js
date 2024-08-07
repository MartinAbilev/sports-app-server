(function(){

	var class_name = 'Participant';

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
		'user_uuid',
		'tournament_uuid',
		'date_created',
		'first_name',
		'last_name',
		'position',
		'age',
		'weight',
		'country',
		'city',
		'cid'
	];

	App[ class_name ].schema =
	{
		uuid				    : {type: 'string'},
		user_uuid				: {type: 'string'},
		tournament_uuid	: {type: 'string'},
		date_created		: {type: 'datetime'},
		first_name			: {type: 'string'},
		last_name				: {type: 'string'},
		position				: {type: 'string'},
		age							: {type: 'string'},
		weight					: {type: 'string'},
		country					: {type: 'string'},
		city						: {type: 'string'},
		cid							: {type: 'string'}
	}

})();
