/**
 * Created by KBG on 2016-03-05.
 */
var server_access_key ="YOUR_SERVER_ACCESS_KEY";
var gcm = require('node-gcm');


var message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        type : "FoRoom GCM Message",
        title : "혜민혜민혜민혜민",
        message : "푸시푸시푸시푸시메세지!!"
    }
});


var sender = new gcm.Sender(server_access_key);
var registrationIds = [];
var registration_id = 'REGISTRATION_ID'
registrationIds.push(registration_id);

sender.send(message, registrationIds, 4, function (err, result) {
    console.log(message);

    console.log(result);
});