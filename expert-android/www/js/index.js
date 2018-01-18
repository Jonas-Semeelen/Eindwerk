/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var storage = window.localStorage;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        var aKey = storage.getItem('access_token');

        if(aKey){
            console.log("Logging in with accestoken: " + storage.getItem('access_token'));
            window.codePush.sync(onSyncStatusChange, {installMode: InstallMode.IMMEDIATE});
        }
        else {
            document.getElementById('loginButton').addEventListener('click', function(e){
            
                var usernameToValidate = document.getElementById('username').value;
                var passwordToValidate = document.getElementById('password').value;

                params = 'grant_type=password&username='+usernameToValidate+'&password='+passwordToValidate;

                httpGetAsync(params,'http://10.129.176.77:3001/oauth/token', function(response){
                   
                    if(!response){
                        console.log("Bad credentials");
                        alert("Foute logingegevens");
                    }
                    else{
                        var resp = JSON.parse(response);
                        //console.log("Accesstoken: " + resp.access_token);
                        storage.setItem('access_token', resp.access_token);
                        setTimeout(function() { window.codePush.sync(onSyncStatusChange, {installMode: InstallMode.IMMEDIATE});}, 2000);
                    }
                    
                });

            });
        }
        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
       
    }

};

function login(){
    console.log("logging in...");
    window.location.href = "sensor_overview.html";
}

function httpGetAsync(parameters, theUrl, callback){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            //console.log("readystate: " + xmlHttp.readyState + ", status: " + xmlHttp.status);
            if (xmlHttp.readyState == 4 ){
                if (xmlHttp.status == 200){
                    //console.log("response: " + xmlHttp.responseText);
                    callback(xmlHttp.responseText);
                }
                else {
                    callback(undefined);
                }
            } 
            
        }
        xmlHttp.open("POST", theUrl, true); // true for asynchronous 
        xmlHttp.setRequestHeader('Authorization','Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW');
        xmlHttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xmlHttp.send(parameters);
}

var onSyncStatusChange =  function(SyncStatus) {
    console.log('in onSyncStatusChange, status: ' + SyncStatus);
    if(SyncStatus==0){
        login();
    }
}

app.initialize();