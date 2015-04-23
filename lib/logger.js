var config = require('config');
var debug = require('debug');
var fs = require('fs');
var log4js = require('log4js');
var path = require('path');

var logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
//Log Settings
log4js.configure({'appenders': config.log.appenders});

function Logger(name) {
  this.name = name;
}

Logger.prototype.error = function(err){
  log4js.getLogger(this.name).error(err);
  debug(this.name)(err);
};

Logger.prototype.info = function(info){
  log4js.getLogger(this.name).info(info);
  debug(this.name)(info);
};

module.exports = function(name) {return new Logger(name);};
