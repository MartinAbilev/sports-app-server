// dependencies
var fs = require( 'fs' );

// core files are shared with front-end
var shared_dir = './shared/';
// main namespace object
App = require( shared_dir + 'core/App_core.js' );

// other components
require( shared_dir + 'core/App.db.js' );
require( shared_dir + 'core/App.base.js' );
require( shared_dir + 'core/App.utils.js' );

var load_dir = function( dir )
{
	fs.readdirSync( './' + dir ).forEach(function( file )
	{
		if( file != '.DS_Store' )
		{
			require( './' + dir + '/' + file );
		}
	});
};

load_dir( shared_dir + 'models' );
