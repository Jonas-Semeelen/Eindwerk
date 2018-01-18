var pg = require('pg'),
  connString ='pg://postgres:root@localhost:5432/Authorization Database';

module.exports = function checkUsernames (user_id_to_check, callback) {
	
	 // De database bevat een tabel 'users' met 3 kolommen: 'user_id', 'username' en 'user_level'
	console.log("[Check] " + user_id_to_check);

	pg.connect(connString, function (err, client, done) {
    if (err) {
    	callback("error tijdens verbinden met DB", undefined);
    }
    else{
	    client.query('SELECT * FROM users WHERE user_id = $1', [user_id_to_check], function (err, result) {
	      if(!err){
	          console.log("[Check] no error");
	          if(result.rowCount>0){
	             var user_level = result.rows[0].user_level;
   				 client.query('SELECT deployment_key FROM deployment_keys WHERE user_level = $1', [user_level], function (err, result) {
		            if(!err){
		            	if(result.rowCount>0){
			            	var deployment_key = result.rows[0].deployment_key;
			            	console.log("[Check] deployment_key: " + deployment_key);
			            	callback(undefined, deployment_key);
			            }
			            else {
			            	callback("Invalid user_level", undefined);
			            }
		            }
		            else {
		            	callback("Error tijdens lookop user_level. " + err, undefined);
		            }
		         });
			    }
	            else {
	              callback("Unauthorized username.", undefined);
	            }
	          }
          else{
             callback("User_id not found", undefined);
          }
	    });
	}
	done();
	});
}