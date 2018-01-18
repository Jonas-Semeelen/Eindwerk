module.exports = function deleteAccessToken (config, req, res) {

  var access_token_to_delete=req.header('access_token_to_delete');

  config.model.deleteAccessToken(access_token_to_delete, function(result){
  	if(result==null){
  		res.send(undefined);
  	}
  	else{
  		res.send(result);
  	}
  });
}
