module.exports = function checkAccessToken (config, req, res) {

  var access_token_to_check=req.header('access_token_to_check');

  config.model.checkAccessToken(access_token_to_check, function(result){
  	if(result==null){
  		res.send("invalid accesstoken");
  	}
  	else{
  		res.send(result);
  	}
  });
}

