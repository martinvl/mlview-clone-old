var Watcher = require('./Watcher');
var inherits = require('inherits');

// --- Constants ----
var SHOT_PATTERN = /\[(\d+)\]\r\nX=(.+)\r\nY=(.+)\r\nV=(.+)/mg;
var SERIES_NUM_PATTERN = /Nr=(\d+)/;
var SERIES_NAME_PATTERN = /Name=[\s]*(.*)/;
var START_SUM_PATTERN = /Start=(.*)/;
var SERIES_SUM_PATTERN = /Series=(.*)/;
var TOTAL_SUM_PATTERN = /Total=(.*)/;
var SHOT_COUNT_PATTERN = /Count=(\d+)/;

function SeriesWatcher(filePath, refresh) {
    this.setProperties(filePath, refresh);
}

module.exports = SeriesWatcher;
inherits(SeriesWatcher, Watcher);

SeriesWatcher.prototype.publishUpdate = function (data) {
    try {
        this.emit('update', parseSeries(data));
    } catch (err) {
        if (err.name === 'TypeError') {
            this.publishError('SeriesParsingError', 'Failed parsing series data');
        } else {
            this.publishError(err);
        }
    }
};

SeriesWatcher.prototype.publishError = function (name, message) {
    if (name === 'FileNotFoundError') {
        message = 'Could not find series data file at ' + this.filePath;
    }

    Watcher.prototype.publishError.apply(this, [name, message]);
};

function parseSeries(data) {
    var result = {
        seriesNum:parseInt(data.match(SERIES_NUM_PATTERN)[1]),
        series:data.match(SERIES_NAME_PATTERN)[1],
        startSum:data.match(START_SUM_PATTERN)[1],
        seriesSum:data.match(SERIES_SUM_PATTERN)[1],
        totalSum:data.match(TOTAL_SUM_PATTERN)[1],
        numShots:parseInt(data.match(SHOT_COUNT_PATTERN)[1]),
        shots:[]
    };

    SHOT_PATTERN.lastIndex = 0;

    for (var i = 0; i < result.numShots; ++i) {
        var shotMatch = SHOT_PATTERN.exec(data);

        result.shots[parseInt(shotMatch[1])-1] = {
            x:parseInt(shotMatch[2]),
            y:parseInt(shotMatch[3]),
            value:shotMatch[4]
        };
    }

    return result;
}