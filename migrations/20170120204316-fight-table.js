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
  db.createTable('fight',
  {
    uuid                         : {type: 'string', primaryKey: true},
    part_uuid                    : {type: 'string'},
    participant_blue_uuid        : {type: 'string'},
    participant_red_uuid         : {type: 'string'},
    winner                       : {type: 'string'},
    date_created  	             : {type: 'datetime'},
    date_start     	             : {type: 'datetime'}
  }, callback);
};

exports.down = function(db, callback) {
    db.dropTable('fight', callback);
};

exports._meta = {
  "version": 1
};
