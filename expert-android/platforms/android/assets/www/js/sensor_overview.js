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
var bearerToken ='4Ud3PFW2lTYSW1VeVya6bdy9ItxAPbCUsuliCT0';

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

        getSensorValues();
      
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
       
    }



};

function getSensorValues(){
    console.log('Getting sensor values...');
    var deviceId='sTQv3mOJYIeoEHY7O89PXX4O';
    
    var doorName='4';    
    var tempName='5';
    var lightName='6';
    var soundName='12';
    var binaryName='1';
    var tempWaarde, deurWaarde, lichtWaarde, geluidWaarde, binaryWaarde;

    // Get temperature value
    httpGet(deviceId, tempName, function(response){
        var parsedResponse=JSON.parse(response);
        var value=parsedResponse.state.value;
        document.getElementById("temp_sensor").innerHTML = value+"&#8451";
        
    });

    // Get door value
    httpGet(deviceId, doorName, function(response){
        var parsedResponse=JSON.parse(response);
        var value=parsedResponse.state.value;

        if(value){
            document.getElementById("door_sensor").innerHTML = "Open";
        }
        else {
            document.getElementById("door_sensor").innerHTML = "Toe";
        }
        
        
    });

    // Get light value
    httpGet(deviceId, lightName, function(response){
        var parsedResponse=JSON.parse(response);
        var value=parsedResponse.state.value;
        if(value>0.1){
            document.getElementById("light_sensor").innerHTML = "Aan";
        }
        else {
            document.getElementById("light_sensor").innerHTML = "Uit";
        }
    });

     // Get sound value
    httpGet(deviceId, soundName, function(response){
        var parsedResponse=JSON.parse(response);
        var value=parsedResponse.state.value;
        document.getElementById("sound_sensor").innerHTML = value+"dB";
        
    });

    // Get temperature value
    httpGet(deviceId, binaryName, function(response){
        var parsedResponse=JSON.parse(response);
        var value=parsedResponse.state.value;
        document.getElementById("binary_sensor").innerHTML = value;
        
    });

}

function httpGet(deviceId, assetName, callback){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            console.log("readystate: " + xmlHttp.readyState + ", status: " + xmlHttp.status);
            if (xmlHttp.readyState == 4 ){
                if (xmlHttp.status == 200){
                    console.log("response: " + xmlHttp.responseText);
                    callback(xmlHttp.responseText);
                }
                else {
                    callback(undefined);
                }
            } 
            
        }
        xmlHttp.open("GET", 'https://api.allthingstalk.io/device/'+deviceId+'/asset/'+assetName, true); // true for asynchronous 
        xmlHttp.setRequestHeader('Authorization','Bearer ' + bearerToken);
        xmlHttp.send();
}

app.initialize();