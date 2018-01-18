var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var getBearerToken = require('./authorise.js');
var getDeploymentKey = require('./check.js');
var config = require("C:/Users/Jonas/Google Drive/masterproef/config.js");

var middleware = module.exports

middleware.checkToken = function(req, res, next) {
	var xhr = new XMLHttpRequest();
	// var request_header = req.header('authorization');
	// username wordt niet standaard meegestuurd
	// Hiervoor moet cordova-plugin-code-push aangepast worden.

	var access_token_to_check;

	// getBearerToken haalt de accesstoken uit de request header
	getBearerToken(req, function(err, result){
		if(err){
		  console.log("[getBearerToken] " + err);
		  res.status(777);
		  res.send("Invalid accesstoken, please log in again");
		}
		else{
		  access_token_to_check=result;
		  console.log("[Middleware] access_token_to_check: "+ access_token_to_check);

		  // De response zal de user_id terugsturen die vasthangt aan het accesstoken.
		  var response; 
		  var user_id_to_check;
		  
		  xhr.onreadystatechange = function () {
		      if (xhr.readyState === 4) {
		          response = { 
		              statusCode: xhr.status, 
		              body: xhr.responseText 
		          };
		          user_id_to_check=xhr.responseText; 	
		          console.log("[Middleware] " + response.statusCode + ": "+ response.body);
		          console.log("[Middleware] user_id_to_check: " + user_id_to_check);

//		          res.locals.user=user_id_to_check;
//		          console.log("[Middleware] res.locals.user: "+res.locals.user);
		          getDeploymentKey(user_id_to_check, function(error, deploymentKey) {
				    if(error){
				      	console.log("[Middleware] " + error);
				      	res.locals.deploymentKey=undefined;
				    }
				    else{
				    	res.locals.deploymentKey=deploymentKey;
				    }
				    next();
				  }); 
		          
		      }
		  };
		  xhr.open('GET', config.authentication_server_url +'/oauth/accesstoken', true); 
		  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		  xhr.setRequestHeader("access_token_to_check", access_token_to_check);
		  xhr.send();
		}   
	});
}