let mongoose = require('mongoose');

let inputSchema = mongoose.Schema(
    {
        actor: String,

        date: Date,

        origin: String,

        action: String,

        label: String,

        /* 
         *   "{"_id":"58a4a7488bf4752738da23e8",
         *   "password":"$2a$08$ov33Sises3CBpzpSaHbiP.z7M5mk.DymB48vkfE9vSigeSlBs8rY6",
         *   "name":"pepe",
         *   "timezone_id":-3,
         *   "client_id":2,
         *   "__v":0,
         *   "active":true,
         *   "user_type":"Monitoreo",
         *   "description":"Default User Description"}"
         */

        object: String,

        /* 
         *   "{"host":"c86246ad.ngrok.io",
         *   "user-agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36",
         *   "ip":"181.168.208.47",
         *   "port":55559,
         *   "username":"pepe",
         *   "password":"123"}"
         */

        description: String
    }
);

inputSchema.post('find', function(result) {
    let mongooseHost = this.mongooseCollection.conn.host;
    let mongoosePort = this.mongooseCollection.conn.port;
    result.forEach(function(input, index, arr) {
        try {
            result[index].host = JSON.parse(input.origin).host;
            result[index].ip = JSON.parse(input.origin).ip;
            result[index].port = JSON.parse(input.origin).port;
            result[index].userAgent = JSON.parse(input.origin)["user-agent"];
        } catch(err) {
            result[index].host = mongooseHost;
            result[index].port = mongoosePort;
            result[index].ip = result[index].userAgent = '';
        }
    });
});

module.exports = mongoose.model('Input', inputSchema, `auditlogs`);