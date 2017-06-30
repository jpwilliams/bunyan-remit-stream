'use strict';
var stream = require('stream');
var util = require('util');
var Writable = stream.Writable;

/**
 * the LogStream constructor.
 * it inherits all methods of a writable stream
 * the constructor takes a options object. A important field is the model, the model will
 * be used for saving the log entry to the mongo db instance.
 * @param options
 * @constructor
 */
function LogStream(remit) {

    this.remit = remit || false

    if (!this.remit) {
        throw new Error('[LogStream] - Fatal Error - No Remit instance provided!')
    }

    Writable.call(this, remit);
}

/**
 * inherits all Writable Stream methods
 */
util.inherits(LogStream, Writable);

/**
 * the _write method must be overridden by this implementation.
 * This method will be called on every write event on this stream.
 * @param chunk
 * @param enc
 * @param cb
 * @returns {*}
 */
LogStream.prototype._write = function (chunk, enc, cb) {

    if (this.remit === false) {
        return cb();
    }

    var entry = JSON.parse(chunk.toString())
    entry.level = get_level(entry.level)

    if (this.remit.version && this.remit.version[0] === '2') {
      this.remit.emit(`log.${entry.level}`)(entry)
    } else {
      this.remit.emit(`log.${entry.level}`, entry)
    }

    return cb()
};

function get_level (level) {
    if (!level || level <= 20) return 'debug'

    switch (level) {
        case 30:
            return 'info'

        case 40:
            return 'warn'

        case 50:
            return 'error'

        case 60:
            return 'fatal'
    }
}

/**
 * export the logStream
 * @param options
 * @returns {LogStream}
 */
module.exports = function (remit) {

    if (!remit) {
        remit = false
    }

    return new LogStream(remit)
};
