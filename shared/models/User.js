(function(){

	var class_name = 'User';

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
		'username',
		'password',
		'role',
		'date_created'
	];

	App[ class_name ].schema =
	{
		uuid				    : {type: 'string'},
		username				: {type: 'string'},
		password				: {type: 'string'},
		role						: {type: 'string'},
		date_created  	: {type: 'datetime'}
	}

})();
