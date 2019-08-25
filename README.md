# presto-client-node


> fork from https://github.com/tagomoris/presto-client-node and add presto-gateway support

Distributed query engine "Presto" 's client library for node.js.

```js
var presto = require('@dalongrong/presto-client');
var client = new presto.Client({user: 'myname'});

client.execute({
  query:   'SELECT count(*) as cnt FROM tblname WHERE ...',
  catalog: 'memory',
  schema: 'default',
  source: 'nodejs-client',
  routingGroup: 'scheduled',
  state:   function(error, query_id, stats){ console.log({message:"status changed", id:query_id, stats:stats}); },
  columns: function(error, data){ console.log({resultColumns: data}); },
  data:    function(error, data, columns, stats){ console.log(data); },
  success: function(error, stats){},
  error:   function(error){}
});
```

## Installation

```
npm install -g @dalongrong/presto-client
```

Or add `@dalongrong/presto-client` to your own `packagen.json`, and do `npm install`.

## API

### new Client(opts)

Instanciate client object and set default configurations.

* opts [object]
  * host [string]
    * Presto coordinator hostname or address (default: localhost)
  * ssl [object]
    * Setting a Hash object enables SSL and verify server certificate with options (default: `null`):
      * `ca`: An authority certificate or array of authority certificates to check the remote host against
      * `cert`: Public x509 certificate to use (default : `null`)
      * `ciphers` : Default cipher suite to use. (default: https://nodejs.org/api/tls.html#tls_modifying_the_default_tls_cipher_suite)
      * `key`: Private key to use for SSL (default: `null`)
      * `passphrase`:  A string of passphrase for the private key or pfx (default: `null`)
      * `pfx`: Certificate, Private key and CA certificates to use for SSL. (default: `null`).
      * `rejectUnauthorized`: If not `false` the server will reject any connection which is not authorized with the list of supplied CAs. This option only has an effect if requestCert is `true` (default: `true`)
      * `secureProtocol`: Optional SSL method to use. The possible values are listed as SSL_METHODS, use the function names as strings. For example, "SSLv3_method" to force SSL version 3 (default: `SSLv23_method`)
      * `servername`: Server name for the SNI (Server Name Indication) TLS extension
  * port [integer]
    * Presto coordinator port (default: 8080)
  * user [string]
    * Username of query (default: process user name)
  * source [string]
    * Source of query (default: nodejs-client)
  * routingGroup  
    * presto-gateway routingGroup name (default: adhoc)
  * basic_auth [object]
    * Pass in a user and password to enable Authorization Basic headers on all requests.
    * basic_auth: {user: "user", password: "password"} (default:null)
  * catalog [string]
    * Default catalog name
  * schema [string]
    * Default schema name
  * checkInterval [integer]
    * Interval milliseconds of each RPC to check query status (default: 800ms)
  * enableVerboseStateCallback [boolean]
    * Enable more verbose callback for Presto query states (default: false)
    * When set to `true`, this flag modifies the condition of the state change callback to return data every `checkInterval`(default: 800ms). Modify `checkInterval` if you wish to change the frequency.
    * Otherwise (`false`), the state change callback will only be called upon a change in state. 
    * The purpose of this variable is to enable verbose update capability in state callbacks. This is such that "percentage complete" and "processed rows" may be extracted despite the state still remaining in a particular state eg. "RUNNING". 
  * jsonParser [object]
    * Custom json parser if required (default: `JSON`)

return value: client instance object

### execute(opts)

This is an API to execute queries. (Using "/v1/statement" HTTP RPC.)

Execute query on Presto cluster, and fetch results.

Attributes of opts [object] are:
* query [string]
* catalog [string]
* schema [string]
* timezone [string :optional]
* routingGroup  [string :optional] presto-gateway routingGroup name
* info [boolean :optional]
  * fetch query info (execution statistics) for success callback, or not (default false)
* cancel [function() :optional]
  * client stops fetch of query results if this callback returns `true`
* state [function(error, query_id, stats) :optional]
  * called when query stats changed
    * `stats.state`: QUEUED, PLANNING, STARTING, RUNNING, FINISHED, or CANCELED, FAILED
  * query_id
    * id string like `20140214_083451_00012_9w6p5`
  * stats
    * object which contains running query status
* columns [function(error, data) :optional]
  * called once when columns and its types are found in results
  * data
    * array of field info
    * `[ { name: "username", type: "varchar" }, { name: "cnt", type: "bigint" } ]`
* data [function(error, data, columns, stats) :optional]
  * called per fetch of query results (may be called 2 or more)
  * data
    * array of array of each column
    * `[ [ "tagomoris", 1013 ], [ "dain", 2056 ], ... ]`
  * columns (optional)
    * same as data of `columns` callback
  * stats (optional)
    * runtime statistics object of query
* success [function(error, stats, info) :optional]
  * called once when all results are fetched (default: value of `callback`)
* error [function(error) :optional]
  * callback for errors of query execution (default: value of `callback`)
* callback [function(error, stats) :optional]
  * callback for query completion (both of success and fail)
  * one of `callback` or `success` must be specified

Callbacks order (success query) is: columns -> data (-> data xN) -> success (or callback)

### query(query_id, callback)

Get query current status. (Same with 'Raw' of Presto Web in browser.)

* query_id [string]
* callback [function(error, data)]

### kill(query_id, callback)

Stop query immediately.

* query_id [string]
* callback [function(error) :optional]

### nodes(opts, callback)

Get node list of presto cluster and return it.

* opts [object :optional]
  * specify null, undefined or `{}` (currently)
* callback [function(error,data)]
  * error
  * data
    * array of node objects

## BIGINT value handling

Javascript standard `JSON` module cannot handle BIGINT values correctly by precision problems.

```js
JSON.parse('{"bigint":1139779449103133602}').bigint //=> 1139779449103133600
```

If your query puts numeric values in its results and precision is important for that query, you can swap JSON parser with any modules which has `parse` method.

```js
var JSONbig = require('json-bigint');
JSONbig.parse('{"bigint":1139779449103133602}').bigint.toString() //=> "1139779449103133602"
// set client option
var client = new presto.Client({
  // ...
  jsonParser: JSONbig,
  // ...
});
```