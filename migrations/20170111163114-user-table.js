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

exports.up = function (db, callback) {
  db.createTable('user',
  {
    uuid            : {type: 'string', primaryKey: true},
    username				: {type: 'string', unique: true},
		password				: {type: 'string'},
		role						: {type: 'string'},
		date_created  	: {type: 'datetime'}
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('user', callback);
};

exports._meta = {
  "version": 1
};
