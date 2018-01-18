function httpGetAsync(theUrl, dateNow, datePast, callback){
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
                xmlHttp.open("GET", theUrl + "?from="+ datePast + "&to=" + dateNow, true); // true for asynchronous 
                xmlHttp.setRequestHeader('Authorization','Bearer 4Ud3PFW2lTYSW1VeVya6bdy9ItxAPbCUsuliCT0');
                xmlHttp.send();
}


var TEN_HOURS = 10 * 60 * 60 * 1000;
var ARRAY_SIZE = 10;
var dateNow = new Date();
var datePast = new Date(dateNow - TEN_HOURS);
var temp1 = new Date("2017-10-04T04:10:14Z");
var temp2 = new Date("2017-10-04T12:10:14Z");

var values = new Array(ARRAY_SIZE);
var labelsHour =  new Array(ARRAY_SIZE);
var labelsMinute =  new Array(ARRAY_SIZE);

httpGetAsync("https://api.allthingstalk.io//asset/QJipoKJ2YebCJpszLNOLRAJZ/states", temp2.toISOString(), temp1.toISOString(), function(result){

	var parsedResult = JSON.parse(result);

	for (i = 0; i < ARRAY_SIZE; i++) { 
    	values[i]=parsedResult.data[i].data;
    }

    //console.log(values);

    var tempDate;
    for (i = 0; i < ARRAY_SIZE; i++) { 
    	tempDate = new Date(parsedResult.data[i].at);
    	labelsHour[i]=tempDate.getHours();
    	labelsMinute[i]=tempDate.getMinutes();
    }

    for (i = 0; i < ARRAY_SIZE; i++) { 
 		if(labelsMinute[i]<10){
 			labelsMinute[i]="0"+labelsMinute[i];
 		}
    }
    //console.log(labelsHours);

    var ctx = document.getElementById("myChart");

	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        //labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	        labels: [labelsHour[0]+"u"+labelsMinute[0],labelsHour[1]+"u"+labelsMinute[1],labelsHour[2]+"u"+labelsMinute[2],labelsHour[3]+"u"+labelsMinute[3],labelsHour[4]+"u"+labelsMinute[4],labelsHour[5]+"u"+labelsMinute[5],labelsHour[6]+"u"+labelsMinute[6],labelsHour[7]+"u"+labelsMinute[7],labelsHour[8]+"u"+labelsMinute[8],labelsHour[9]+"u"+labelsMinute[9]],
	        datasets: [{
	            label: 'Temperatuur van de voorbije 5 uur',
	            //data: [12, 19, 3, 5, 2, 3],
	            data: [values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7],values[8],values[9]],
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)'
	            ],
	            borderColor: [
	                'rgba(255,99,132,1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)'
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    suggestedMin: 22,
	                    suggestedMax: 25
	                }
	            }]
	        }
	    }
	});

});

