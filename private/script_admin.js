var get_url   = window.location;
var host      = get_url.host;
var base_url  = get_url.protocol + "//" + get_url.host + "/" + get_url.pathname.split('/')[1];

console.log('url', base_url, host);

( function()
{
  console.log('Redy..1');
})();

window.onload = function ()
{
  sessid = $( 'body' ).attr( 'data-sessid' );
  user_uuid = $( 'body' ).attr( 'data-user_uuid' );
  console.log( sessid, user_uuid );

  var cookieString = 'SESSID=' + sessid;
  document.cookie = cookieString;
  $( 'body' ).removeAttr( 'data-sessid' );
  $( 'body' ).removeAttr( 'data-user_uuid' );
  // dont create more code here
  main ();
};

function main ()
{
  var source   = $("#participant-template").html();
  var template = Handlebars.compile(source);

  get_participants( function ( participants )
  {
    if( participants.res )
    {
      participants = participants.res;
      console.log('participants', participants);
      if( participants.length > 0 )
      {
        $( '.participant_form').attr( 'data-visible', '0' );
        $( '#participants' ).html('');

        participants.forEach( function ( participant )
        {
          $( '#participants' ).append( template( { name: participant.first_name + ' ' + participant.last_name, position: participant.position } ) );
        });
      }

    }
    else
    {
      console.log('participants post error', participants);
    }

  });

  $( '.button.create_participant' ).click( function ( event )
  {
    event.stopPropagation();

    var participant =
    {
      user_uuid: user_uuid,
      first_name: $( 'input[name="first_name"]' ).val(),
      last_name: $( 'input[name="last_name"]' ).val()
    }

    console.log( 'Create participant', participant );
    create_participant( participant, function( res )
    {
      console.log( 'participant created', res );
      $( '.participant_form').attr( 'data-visible', '0' );
      main(); //reload
    });
  });

};

function get_participants( callback )
{
  var callback = callback || function (){};
  post( 'get_participants', { user_uuid: user_uuid }, callback );
};

function create_participant( participant, callback )
{
  var callback = callback || function (){};
  post( 'create_participant', participant, callback );
};

function post( path, params, callback )
{
  var callback = callback || function (){};

  path = '/' + sessid + '/' + path;

  console.log('post', path, params);

  var url = 'http://' + host + path;

  $.ajax(
  {
    type: 'POST',
    dataType: 'json',
    url: url,
    data: params,
    success: function( res )
    {
      callback( { res: res, err: null } );
    },
    error: function(XMLHttpRequest, text_status, error_thrown)
    {
      callback( { res: null, err: { text_status: text_status, error_thrown: error_thrown } } );
    }

  });

};
