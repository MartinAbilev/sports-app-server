app.add_routes = function ( session )
{
  var ses = '/' + session;

  app.get( ses + '/*',function ( req, res )
  {
    var filename = req.url.replace( '/' + session, '' );
    res.sendFile( '/private' + filename , { root : __dirname} );
  });

  app.post( ses + '/create_participant',function ( req, res )
  {
    console.log( 'Create participant for user', req.body );

    app.create_participant( req, function ( participant )
    {
      res.send( { success: true, participant: participant } );
    });
  });

  app.post( ses + '/create_tournament',function ( req, res )
  {
    var user_uuid = req.body.user_uuid;

    console.log( 'Create tournament for user', user_uuid );

    if( app.roles[session] == 'admin' )
    {
      app.create_tournament( req, function ( tournament )
      {
        res.send( { success: true, tournament: tournament } );
      });
    };

  });

  app.post( ses + '/create_part',function ( req, res )
  {
    console.log( 'Create part for user', req.body );

    app.create_part( req, function ( part )
    {
      res.send( part );
    });
  });

  app.post( ses + '/create_fight',function ( req, res )
  {
    console.log( 'Create fight for user', req.body );

    app.create_fight( req, function ( fight )
    {
      res.send( fight );
    });
  });

  app.post( ses + '/create_categories',function ( req, res )
  {
    console.log( 'Create categories for user', req.body );

    app.create_categories( req, function ( categories )
    {
      res.send( categories );
    });
  });

  app.post( ses + '/get_participants',function ( req, res )
  {
    var user_uuid = req.body.user_uuid;
    console.log( 'Get participants for user', user_uuid );


    console.log('ROLES',app.roles);

    if( app.roles[session] == 'admin' ) user_uuid = 'admin'

    app.get_participants( user_uuid, function ( participants )
    {
      res.send( { success: true, participants: participants } );
    });
  });

  app.post( ses + '/get_users',function ( req, res )
  {
    var user_uuid = req.body.user_uuid;
    console.log( 'Get users for user', user_uuid );

    if( app.roles[session] == 'admin' ) user_uuid = 'admin';

    app.get_users( user_uuid, function ( users )
    {
      res.send( { success: true, users: users } );
    });
  });

  app.post( ses + '/get_parts',function ( req, res )
  {
    var tournament_uuid = req.body.tournament_uuid;
    console.log( 'Get parts', tournament_uuid );

    app.get_parts( tournament_uuid, function ( parts )
    {
      res.send( parts );
    });
  });

  app.post( ses + '/get_categories',function ( req, res )
  {
    var tournament_uuid = req.body.tournament_uuid;
    console.log( 'Get parts', tournament_uuid );

    app.get_categories( tournament_uuid, function ( categories )
    {
      res.send( categories );
    });
  });

  app.post( ses + '/get_fights',function ( req, res )
  {
    var part_uuid = req.body.part_uuid;
    console.log( 'Get fights for part', part_uuid );

    app.get_fights( part_uuid, function ( fights )
    {
      res.send( fights );
    });
  });

  app.post( ses + '/update_user',function ( req, res )
  {
    var user = req.body;
    console.log( 'Update user with uuid', user.uuid );

    app.update_user( user, function ( user )
    {
      res.send( { success:true, user: user } );
    });
  });

  app.post( ses + '/update_participant',function ( req, res )
  {
    var participant = req.body;
    console.log( 'Update participant with uuid', participant );

    app.update_participant( participant, function ( participant )
    {
      res.send( { success:true, participant: participant } );
    });
  });


};
