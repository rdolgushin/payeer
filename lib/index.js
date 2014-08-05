var _      = require('underscore'),
    stdlog = require('stdlog');
    util   = require('util'),
    https  = require('https');

var logger = stdlog({
  level: 'debug'
});

Payeer = (function() {

  Payeer.prototype.hostname = 'payeer.com';
  Payeer.prototype.path     = '/ajax/api/api.php';
  Payeer.prototype.agent    = 'Mozilla/5.0 (Windows NT 6.1; rv:12.0) Gecko/20100101 Firefox/12.0';

  Payeer.prototype.auth     = {};

  Payeer.prototype._output  = null;
  Payeer.prototype.errors   = null;
  Payeer.prototype.language = 'ru';

  Payeer.prototype.debug    = false;

  function Payeer() {
  }

  Payeer.create = function(account, apiId, apiPass, debug, callback) {

    var payeer = new Payeer();

    if (!callback) {
      callback = debug;
      payeer.debug = false;
    } else {
      payeer.debug = debug || false;
    }

    var arr = {
      account: account,
      apiId: apiId,
      apiPass: apiPass
    };

    payeer.getResponse(arr, function(error, response) {

      if (!_.isEmpty(response.errors)) {
        payeer.errors = response.errors;
      } else if (response.auth_error == '0') {
        payeer.auth = arr;
      } else {
        error = new Error('Authentication failed');
      }

      callback(error, payeer);
    });
  };

  Payeer.prototype.isAuth = function() {
    return !_.isEmpty(this.auth);
  };

  Payeer.prototype.getResponse = function(arPost, callback) {

    var debug = this.debug;

    if (this.isAuth()) {
      _.extend(arPost, this.auth);
    }

    var data = [];

    _.keys(arPost).forEach(function(key) {
      var urlParam = encodeURIComponent(key) + '=' +
                     encodeURIComponent(arPost[key]);
      data.push(urlParam);
    });

    data.push('language=' + this.language);

    var dataStr = data.join('&');

    var options = {
      hostname: this.hostname,
      path: this.path,
      method: 'POST',
      headers: {
        'User-Agent': this.agent,
        'Content-Length': dataStr.length,
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var request = https.request(options, function(response) {

      if (debug) {
        logger.debug('response status: ' + response.statusCode);
        logger.debug('response headers:\n' + util.inspect(response.headers));
      }

      response.setEncoding('utf8');

      var responseData = '';

      response.on('data', function (chunk) {
        responseData += chunk;
      });

      response.on('end', function() {

        if (debug) {
          logger.debug('response data:\n' + responseData);
        }

        var parsedResponse = JSON.parse(responseData || '{}'),
            error          = null;

        if (!_.isEmpty(parsedResponse.errors)) {
          error = new Error(util.inspect(parsedResponse.errors));
        }

        callback(error, parsedResponse);
      });
    });

    request.write(dataStr);
    request.end();
  };

  Payeer.prototype.getPaySystems = function(callback) {
    this.getResponse({ action: 'getPaySystems' }, function(error, response) {
      callback(error, response);
    });
  };

  Payeer.prototype.initOutput = function(arr, callback) {

    var payeer  = this,
        arrPost = _.clone(arr);

    arrPost.action = 'initOutput';

    this.getResponse(arrPost, function(error, response) {
      if (_.isEmpty(response.errors)) {
        payeer._output = arr;
        callback(error, true);
      } else {
        payeer.errors = response.errors;
        callback(error, false);
      }
    });
  };

  Payeer.prototype.output = function(callback) {

    var payeer  = this,
        arrPost = this._output;

    arrPost.action = 'output';

    this.getResponse(arrPost, function(error, response) {
      if (_.isEmpty(response.errors)) {
        callback(error, response.historyId);
      } else {
        payeer.errors = response.errors;
        callback(error, false);
      }
    });
  };

  Payeer.prototype.getHistoryInfo = function(historyId, callback) {
    this.getResponse({ action: 'historyInfo', historyId: historyId },
                     function(error, response) {
      callback(error, response);
    });
  };

  Payeer.prototype.getBalance = function(callback) {
    this.getResponse({ action: 'balance' }, function(error, response) {
      callback(error, response);
    });
  };

  Payeer.prototype.getErrors = function() {
    return this.errors;
  };

  Payeer.prototype.transfer = function(arPost, callback) {
    arPost.action = 'transfer';
    this.getResponse(arPost, function(error, response) {
      callback(error, response);
    });
  };

  Payeer.prototype.setLang = function(language) {
    this.language = language;
    return this;
  };

  Payeer.prototype.getShopOrderInfo = function(arPost, callback) {
    arPost.action = 'shopOrderInfo';
    this.getResponse(arPost, function(error, response) {
      callback(error, response);
    });
  };

  Payeer.prototype.checkUser = function(arPost, callback) {

    var payeer = this;

    arPost.action = 'checkUser';

    this.getResponse(arPost, function(error, response) {
      if (_.isEmpty(response.errors)) {
        callback(error, true);
      } else {
        payeer.errors = response.errors;
        callback(error, false);
      }
    });
  };

  return Payeer;

})();

module.exports = Payeer
