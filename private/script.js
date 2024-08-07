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

  $(".brackets").brackets({
      titles: titles,
      rounds: rounds,
      color_title: 'black',
      border_color: '#00F',
      color_player: 'black',
      bg_player: 'white',
      color_player_hover: 'white',
      bg_player_hover: 'blue',
      border_radius_player: '10px',
      border_radius_lines: '10px',
  });

  
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



var rounds;

rounds = [


    //-- ronda 1
    [

        {
            player1: { name: "Player 111", winner: true, ID: 111, url: 'http://www.google.com' },
            player2: { name: "Player 211", ID: 211 }
        },

        {
            player1: { name: "Player 112", winner: true, ID: 112 },
            player2: { name: "Player 212", ID: 212 }
        },

        {
            player1: { name: "Player 113", winner: true, ID: 113 },
            player2: { name: "Player 213", ID: 213 }
        },

        {
            player1: { name: "Player 114", winner: true, ID: 114 },
            player2: { name: "Player 214", ID: 214 }
        },

        {
            player1: { name: "Player 115", winner: true, ID: 115, url: 'goggle.com' },
            player2: { name: "Player 215", ID: 215 }
        },

        {
            player1: { name: "Player 116", winner: true, ID: 116 },
            player2: { name: "Player 216", ID: 216 }
        },

        {
            player1: { name: "Player 117", winner: true, ID: 117 },
            player2: { name: "Player 217", ID: 217 }
        },

        {
            player1: { name: "Player 118", winner: true, ID: 118 },
            player2: { name: "Player 218", ID: 218 }
        },
    ],

    //-- ronda 2
    [

        {
            player1: { name: "Player 111", winner: true, ID: 111 },
            player2: { name: "Player 212", ID: 212 }
        },

        {
            player1: { name: "Player 113", winner: true, ID: 113 },
            player2: { name: "Player 214", ID: 214 }
        },

        {
            player1: { name: "Player 115", winner: true, ID: 115 },
            player2: { name: "Player 216", ID: 216 }
        },

        {
            player1: { name: "Player 117", winner: true, ID: 117 },
            player2: { name: "Player 218", ID: 218 }
        },
    ],

    //-- ronda 3
    [

        {
            player1: { name: "Player 111", winner: true, ID: 111 },
            player2: { name: "Player 113", ID: 113 }
        },

        {
            player1: { name: "Player 115", winner: true, ID: 115 },
            player2: { name: "Player 218", ID: 218 }
        },
    ],

    //-- ronda 4
    [

        {
            player1: { name: "Player 113", winner: true, ID: 113 },
            player2: { name: "Player 218", winner: true, ID: 218 },
        },
    ],
    //-- Champion
    [

        {
            player1: { name: "Player 113", winner: true, ID: 113 },
        },
    ],

];

var titles = ['Ronda 1', 'Ronda 2', 'Ronda 3', 'Ronda 4', 'Ronda 5'];
