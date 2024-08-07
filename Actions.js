app.get_participants = function( user_uuid, callback )
{
  var callback = callback || function(){};

  var params = { user_uuid: user_uuid };
  if( user_uuid == 'admin' ) params = null;

  App.db.select( 'Participant', params, function ( results )
  {
    if( results )
    {
      console.log( 'sql res participants', results );
      callback( results.results );
    }
    else
    {
      callback( {} );
    }
  });

};

app.get_tournaments = function( tournament_uuid, callback )
{
  var callback = callback || function(){};

  if( tournament_uuid ) params = { tournament_uuid: tournament_uuid };
  else params = false;

  App.db.select( 'Tournament', params, function ( results )
  {
    if( results )
    {
      console.log( 'sql res tournaments', results );
      callback( results.results );
    }
    else
    {
      callback( {} );
    }
  });

};

app.get_all_users = function( callback )
{
  var callback = callback || function(){};

  App.db.select( 'User', false, function ( results )
  {
    if( results )
    {
      console.log( 'sql res participants', results );
      callback( results.results );
    }
    else
    {
      callback( {} );
    }
  });

};

app.get_users = function( user_uuid, callback )
{
  var callback = callback || function(){};

  if( user_uuid == 'admin' )
  {
    App.db.select( 'User', false, function ( results )
    {
      if( results )
      {
        console.log( 'sql res users', results );
        callback( results.results );
      }
      else
      {
        callback( {} );
      }
    });
  }
  else
  {

    App.db.select( 'User', { uuid: user_uuid }, function ( results )
    {
      if( results )
      {
        console.log( 'sql res users', results );
        callback( [results.results[0]] );
      }
      else
      {
        callback( {} );
      }
    });
  }
};

app.create_participant = function( req, callback )
{
  var callback = callback || function(){};

  var participant = new App.Participant( req.body );
  participant.insert();
  participant.date_created = new Date();
  participant.position = 'not set';
  console.log("NEW PARTICIPANT", participant);
  App.db.persist( function(err)
  {
    callback( participant );
  });
};

app.create_tournament = function( req, callback )
{
  var callback = callback || function(){};

  var tournament = new App.Tournament( req.body );
  tournament.insert();
  tournament.date_created = new Date();
  console.log("NEW TOURNAMENT", tournament);
  App.db.persist( function(err)
  {
    callback( tournament );
  });
};

app.update_user = function( user, callback )
{
  var callback = callback || function(){};

  var user = new App.User( user );
  App.db.insert('User', user);

  App.db.persist( function(err)
  {
    callback( user );
  });
};

app.update_participant = function( participant, callback )
{
  var callback = callback || function(){};

  var participant = new App.Participant( participant );
  App.db.insert('Participant', participant);

  App.db.persist( function(err)
  {
    callback( participant );
  });
};
