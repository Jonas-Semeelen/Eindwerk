var express = require('express');
var router = express.Router();
var _ = require('lodash');
var security = require('../core/utils/security');
var accountManager = require('../core/services/account-manager')();
var AppError = require('../core/app-error');
var pg = require('pg'),
  model = module.exports,
  connString ='pg://postgres:root@localhost:5432/Update Server Database';

var accessTokenLifeTime=1; // Expressed in hours

router.get('/login', (req, res) => {
  console.log("In auth.js in get login route");
  var config = require('../core/config');
  var codePushWebUrl = _.get(config, 'common.codePushWebUrl');
  var isRedirect = false;
  if (codePushWebUrl) {
    var validator = require('validator');
    if (validator.isURL(codePushWebUrl)){
      isRedirect = true;
      console.log(isRedirect);
    }
  }
  if (isRedirect) {
    //res.redirect(`${codePushWebUrl}/login`);
    res.render('auth/login', { title: 'CodePushServer' });
  } else {
    console.log("render auth/login");
    res.render('auth/login', { title: 'CodePushServer' });
  }
});

router.get('/link', (req, res) => {
  console.log("In auth.js in link route");
  res.redirect(`/auth/login`);
});

router.get('/register', (req, res) => {
  console.log("In auth.js in register route");
  var config = require('../core/config');
  var codePushWebUrl = _.get(config, 'common.codePushWebUrl');
  var isRedirect = false;
  if (codePushWebUrl) {
    var validator = require('validator');
    if (validator.isURL(codePushWebUrl)){
      isRedirect = true;
    }
  }
  if (isRedirect) {
    res.redirect(`${codePushWebUrl}/register`);
  } else {
    res.render('auth/login', { title: 'CaaodePushServer' });
  }
});

router.post('/logout', (req, res) => {
  console.log("logged out");
  res.send("ok");
});

router.post('/login', (req, res, next) => {
  console.log("In auth.js in post login route");
  var account = _.trim(req.body.account);
  var password = _.trim(req.body.password);
  var config = require('../core/config');
  var tokenSecret = _.get(config, 'jwt.tokenSecret');
  accountManager.login(account, password)
  .then((users) => {
    var jwt = require('jsonwebtoken');
    return jwt.sign({ uid: users.id, hash: security.md5(users.ack_code), expiredIn: 7200 }, tokenSecret);
  })
  .then((token) => {
    res.send({status:'OK', results: {tokens: token}});
  })
  .catch((e) => {
    console.log("error gevangen");
    if (e instanceof AppError.AppError) {
      res.send({status:'ERROR', errorMessage: e.message});
    } else {
      next(e);
    }
  });
});

router.post('/accesstoken', (req, res) => {
  console.log("In mijn eigen geschreven accestoken");
  var client_id = _.trim(req.body.client_id);
  var access_token = _.trim(req.body.access_token);
  var expire_date= new Date();
  expire_date.setHours(expire_date.getHours()+accessTokenLifeTime);
  
  expire_date.toISOString().replace(/T/, ' ').replace(/Z/, '')

  var rowCount=0;
  console.log(/*"client_id: " + client_id + "; access_token: " + access_token + */"; expire_date: " + expire_date);

  pg.connect(connString, function (err, client, done) {
    if (err){
      console.log("connection error in saveAccessToken in update database");
      done();
    }
   
    client.query('INSERT INTO authorized_clients (client_id, access_token, expire_date) VALUES ($1, $2, $3)', [client_id, access_token, expire_date],
      function (error, result) {
        if(error){
          client.query('UPDATE authorized_clients SET access_token=$1, expire_date=$2 WHERE client_id=$3', [access_token, expire_date, client_id],
             function (erro, result) {
                if(!erro){
                  console.log('Accesstoken voor client ' + client_id +' upgedatet');
                  done();
                }
                else{
                  console.log(erro);
                  done();
                } 
            });
        }
        else{
          console.log('Accesstoken van client ' + client_id + ' toegevoegd');
          done();
        }       
      });
    });


});

module.exports = router;
