'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.addColumn( 'participant', 'tournament_uuid', 'string', callback );
  db.addColumn( 'participant', 'first_name', 'string', callback );
  db.addColumn( 'participant', 'last_name', 'string', callback );
  db.addColumn( 'participant', 'position', 'string', callback );
  db.addColumn( 'participant', 'age', 'string', callback );
  db.addColumn( 'participant', 'weight', 'string', callback );
  db.addColumn( 'participant', 'country', 'string', callback );
  db.addColumn( 'participant', 'city', 'string', callback );
  db.addColumn( 'participant', 'cid', 'string', callback );
};

exports.down = function(db, callback) {
    db.removeColumn( 'participant', 'tournament_uuid', callback );
    db.removeColumn( 'participant', 'first_name', callback );
    db.removeColumn( 'participant', 'last_name', callback );
    db.removeColumn( 'participant', 'position', callback );
    db.removeColumn( 'participant', 'age', callback );
    db.removeColumn( 'participant', 'weight', callback );
    db.removeColumn( 'participant', 'country', callback );
    db.removeColumn( 'participant', 'city', callback );
    db.removeColumn( 'participant', 'cid', callback );
};

exports._meta = {
  "version": 1
};
