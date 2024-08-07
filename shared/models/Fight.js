(function(){

	var class_name = 'fight';

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
    'part_uuid',
    'participant_blue_uuid',
    'participant_red_uuid',
    'winner',
    'date_created',
    'date_start'
	];

	App[ class_name ].schema =
	{
		uuid                         : {type: 'string'},
    part_uuid                    : {type: 'string'},
    participant_blue_uuid        : {type: 'string'},
    participant_red_uuid         : {type: 'string'},
    winner                       : {type: 'string'},
    date_created  	             : {type: 'datetime'},
    date_start     	             : {type: 'datetime'}
	}

})();
