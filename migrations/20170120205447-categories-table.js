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
  db.createTable('categories',
  {
    uuid                 : {type: 'string', primaryKey: true},
    tournament_uuid      : {type: 'string'},
    date_created  	     : {type: 'datetime'},
    categorie    	       : {type: 'string'},
    from    	           : {type: 'int'},
    to    	             : {type: 'int'}
  }, callback);
};

exports.down = function(db, callback) {
    db.dropTable('categories', callback);
};

exports._meta = {
  "version": 1
};
