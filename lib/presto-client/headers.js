var Headers = exports.Headers = function(){
};

Headers.USER = 'X-Presto-User';

Headers.SOURCE = 'X-Presto-Source';
Headers.CATALOG = 'X-Presto-Catalog';
Headers.SCHEMA = 'X-Presto-Schema';

// Add X-Presto-Routing-Group for support presto gateway
Headers.ROUTING_GROUP = 'X-Presto-Routing-Group';

Headers.TIME_ZONE = 'X-Presto-Time-Zone';

Headers.CURRENT_STATE = 'X-Presto-Current-State';
Headers.MAX_WAIT = 'X-Presto-Max-Wait';
Headers.MAX_SIZE = 'X-Presto-Max-Size';
Headers.PAGE_SEQUENCE_ID = 'X-Presto-Page-Sequence-Id';

Headers.SESSION = 'X-Presto-Session';

Headers.USER_AGENT = 'User-Agent';

Headers.AUTHORIZATION = 'Authorization';