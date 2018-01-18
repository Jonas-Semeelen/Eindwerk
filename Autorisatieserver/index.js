var express = require('express'); 
var bodyParser = require('body-parser');
var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
var config = require("config.js"); //configuratiebestand waar de ip-adressen van de servers instaan
var https = require('https');

// Configuratie van de HTTPS server
var privateKey  = fs.readFileSync('auto_server.key');
var certificate = fs.readFileSync('auto_server.crt');
var passPhrase = 'abc123';
var sub_ca = fs.readFileSync('sub-ca.crt');
var options = {ca: sub_ca, key: privateKey, cert: certificate, passphrase: passPhrase};

var middleware = require('./lib/middleware');
var queryStringify = require('./lib/queryStringify.js');

var app = express();
var httpsServer = https.createServer(options, app);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.all('/updateCheck', middleware.checkToken, function(req, res) {
  var deploymentKey=res.locals.deploymentKey;
  if(deploymentKey){

    var xhr = new XMLHttpRequest();

    var appVersion = req.query.appVersion;
    var packageHash = req.query.packageHash;
    var isCompanion = req.query.ignoreAppVersion
    var label = req.query.label;
    var clientUniqueId = req.query.clientUniqueId;
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            res.status(200);
            res.send(xhr.responseText); 
        }
    };
    var updateRequest = {
        deploymentKey: deploymentKey,
        appVersion: appVersion,
        packageHash: packageHash,
        isCompanion: isCompanion,
        label: label,
        clientUniqueId: clientUniqueId
    };
    var requestUrl = config.update_server_url + "/updateCheck?" + queryStringify(updateRequest);
    xhr.open('GET', requestUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
    


  }
  else{
    res.send("Middleware checktoken failed");
  }
});


app.all('/:downloadUrl', middleware.checkToken, function(req, res) {
  var deploymentKey=res.locals.deploymentKey;
  if(deploymentKey){
    req.pipe(request(config.update_server_url + '/' + req.params.downloadUrl)).pipe(res);
  }
  else {
    res.status(401);
    res.send("Unauthorized request");
  }
});


app.post('/reportStatus/:option', middleware.checkToken, function(req, res){
  var deploymentKey=res.locals.deploymentKey;
  if(deploymentKey){
    res.send("OK");
  }
  else {
    res.status(401);
    res.send("Unauthorized request");
  }
});


httpServer.listen(3002);
console.log("[Index] authorization server listening on port 3002");