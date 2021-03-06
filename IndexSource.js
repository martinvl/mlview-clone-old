var DataSource = require('./DataSource');
var inherits = require('inherits');

// --- Constants ---
var HOST_PATTERN = /Host=([^\r\n]*)/;
var INDEX_PATTERN = /([^;\r\n]*);([^;]*);([^;]*);([^;]*);([^;]*);([^;]*);([^;]*);([^;]*);/g;

function IndexSource(filePath, refresh) {
    this.setProperties(filePath, refresh);
}

module.exports = IndexSource;
inherits(IndexSource, DataSource);

IndexSource.prototype.setup = function () {
};

IndexSource.prototype.publishData = function (data) {
    try {
        this.emit('data', parseIndex(data));
    } catch (err) {
        err.response = data;

        if (err.name === 'TypeError') {
            this.publishError('IndexParsingError', 'Failed parsing index data', err);
        } else {
            this.publishError(err);
        }
    }
};

IndexSource.prototype.publishError = function (name, message, error) {
    if (name === 'FileNotFoundError') {
        message = 'Could not find index file at ' + this.filePath;
    }

    DataSource.prototype.publishError.apply(this, [name, message, error]);
};

function parseIndex(data) {
    var result = {
        host:data.match(HOST_PATTERN)[1],
        cards:[]
    };

    INDEX_PATTERN.lastIndex = 0;

    for (var indexMatch; indexMatch = INDEX_PATTERN.exec(data);) {
        result.cards.push({
            range:indexMatch[1],
            relay:indexMatch[2],
            lane:indexMatch[3],
            name:indexMatch[4],
            club:indexMatch[5],
            className:indexMatch[6],
            category:indexMatch[7],
            startsum:indexMatch[8]
        });
    }

    return result;
}
