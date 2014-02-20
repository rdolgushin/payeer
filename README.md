Payeer.com API client for Node.js
=================================

About
-----

In general, this library is very similar to her PHP-sister,
but written in Node.js-way and has some minor differences (but the same API).

Installation
------------

```bash
$ npm install payeer
```

Usage
-----

```javascript
var Payeer    = require('payeer');

var accountId = 'P123456',
    apiId     = '111222333',
    apiKey    = 'TOPSECRETKEY';

Payeer.create(accountId, apiId, apiKey, function(error, payeer) {

  // When creating a new Payeer instance, it will try to connect
  // to the https://payeer.com with authentication request.

  if (error) {
    // If there is some error, we handle it, for example:
    return console.log(error);
  }

  // Here we can do something useful.
  // For example, get account balance:
  payeer.getBalance(function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response);
    }
  });
});
```

API
---

### Payeer.create(account, apiId, apiPass, debug, callback)

* `debug` - optional parameter. Useful for application debugging and
resolving strange problems. Default: `false`.

### payeer.isAuth()

### payeer.getPaySystems(callback)

### payeer.initOutput(arr, callback)

### payeer.output(callback)

### payeer.getHistoryInfo(historyId, callback)

### payeer.getBalance(callback)

### payeer.getErrors()

### payeer.transfer(arPost, callback)

### payeer.setLang(language)

Default Payeer instance language is `ru`.

### payeer.getShopOrderInfo(arPost, callback)

### payeer.checkUser(arPost, callback)
