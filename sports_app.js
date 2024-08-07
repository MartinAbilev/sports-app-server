var morgan      = require('morgan');
var bodyParser  = require('body-parser');
var express     = require('express');
var needle      = require('needle');
var url         = require('url');
var datetime    = require('node-datetime');
var pug         = require('pug');
var path        = require('path');

app = express();// make app global

require( './App.js' );
require( './Actions.js' );
require( './Routes.js' );

var FormData    = require('form-data');

App.mysql       = require('mysql');

var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var log = console;

var requests = {};
var reports_requested = {};

UUID = require('node-uuid');
UUID.generate = UUID.v4;

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

var sessions = [];
app.roles = {};

fs.readFile('./database.json', 'utf8', function (err,data)
{
  if (err)
  {
    return console.log(err);
  }

  data =  JSON.parse(data).dev;

  App.db.pool = App.mysql.createPool(
  {
    connectionLimit : 100,
    host        : data.host,
    user        : data.user,
    password    : data.password,
    database    : data.database,
    timezone    : 'utc',
    dateStrings : 'date'
  });

  App.db.connect_db( function ()
  {

  } );

  var server = app.listen( data.host_port, '0.0.0.0', function ()
  {
    console.log( 'server app listening on port ', data.host_port );
  });
  server.timeout = 60000 * 60 * 3;
});

app.all('/*', function(req, res, next)
{
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use( express.static('public/Sports_app') );

app.post('/login', function (req, res)
{
  console.log( 'LOGIN', req.body );
  var login_form =
  {
    username: req.body.username,
    password: req.body.password,
    register: req.body.register
  }

  if( login_form.register == 'register' )
  {
    register( login_form, res );
  }
  else
  {
    login( login_form, res );
  }

});

app.post( '/*get_tournaments',function ( req, res )
{
  var user_uuid = req.body.user_uuid;
  console.log( 'Get tournaments' );

  app.get_tournaments( user_uuid, function ( tournaments )
  {
    res.send( { success: true, tournaments: tournaments } );
  });
});

var login = function ( login_form, res )
{
  App.db.select( 'User', { username: login_form.username, password: login_form.password }, function ( results )
  {
    if( results.results.length > 0 )
    {
      var session = UUID.generate();

      var role = results.results[0].role;

      sessions.push( session );

      app.add_routes( session );

      if( role == 'admin')
      {
        app.roles[session] = 'admin';
        app.get_all_users( function ( users )
        {
          res.send( { success: true, sessid: session, user_uuid: results.results[0].uuid, role: role, users: users } );
        });
      }
      else
      {
        res.send( { success: true, sessid: session, user_uuid: results.results[0].uuid, role: role, users: [results.results[0]] } );
      }

    }
    else
    {
      res.send( { success: false, sessid: null, user_uuid: null, error: 'Invalid user !!!' } );
    }
  });

};

var register = function ( login_form, res )
{
  console.log('REGISTER FIRED');
  var user = new App.User( { username: login_form.username, password: login_form.password, role: 'user', date_created: App.u.date_now() } );
  user.insert();

  App.db.select( 'User', { username: login_form.username }, function ( results )
  {
    if( results.results.length < 1 )
    {
      App.db.persist( function ( err )
      {
        login( login_form, res );
      });

    }
    else
    {
      res.send( { success: false, error: 'USERNAME TAKEN!!!!'} );
    }
  });

};

console.log( App.u.date_now() );
