'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var security = require('../core/utils/security');
var models = require('../models');
var moment = require('moment');
var AppError = require('./app-error')

var middleware = module.exports

//checkAuthToken checkt het token van gebruiker van de CLI met de access-token van de app.
// Op deze manier kan enkel een bevoegde persoon zijn app bewerken etc..
var checkAuthToken = function (authToken) {
  console.log("Checking auth token: " + authToken);
  var objToken = security.parseToken(authToken);
  console.log("objToken: " + objToken);
  return models.Users.findOne({
    where: {identical: objToken.identical}
  })
  .then((users) => {
    if (_.isEmpty(users)) {
      throw new AppError.Unauthorized();
    }
    return models.UserTokens.findOne({
      where: {tokens: authToken, uid: users.id, expires_at: { gt: moment().format('YYYY-MM-DD HH:mm:ss') }}
    })
    .then((tokenInfo) => {
      if (_.isEmpty(tokenInfo)){
        throw new AppError.Unauthorized()
      }
      return users;
    })
  }).then((users) => {
    return users;
  })
}
// Hier wordt de JWT gecheckt.
var checkAccessToken = function (accessToken) {
  console.log("JWT wordt gecheckt: " + accessToken);
  return new Promise((resolve, reject) => {
    if (_.isEmpty(accessToken)) {
      throw new AppError.Unauthorized();
    }
    var config = require('../core/config');
    var tokenSecret = _.get(config, 'jwt.tokenSecret');
    var jwt = require('jsonwebtoken');
    var authData = jwt.verify(accessToken, tokenSecret);
    var uid = _.get(authData, 'uid', null);
    var hash = _.get(authData, 'hash', null);
    if (parseInt(uid) > 0) {
      return models.Users.findOne({
        where: {id: uid}
      })
      .then((users) => {
        if (_.isEmpty(users)) {
          throw new AppError.Unauthorized();
        }
        if (!_.eq(hash, security.md5(users.get('ack_code')))){
          throw new AppError.Unauthorized();
        }
        resolve(users);
      })
      .catch((e) => {
        reject(e);
      });
    } else {
      reject(new AppError.Unauthorized());
    }
  });
}


middleware.checkToken = function(req, res, next) {
  var authArr = _.split(req.get('Authorization'), ' ');
  var authType = 1;
  var authToken = null;
  if (_.eq(authArr[0], 'Bearer')) {
    console.log('Bearer');
    authType = 1;
    authToken = authArr[1]; //Bearer
  } else if(_.eq(authArr[0], 'Basic')) {
    console.log('Basic');
    authType = 2;
    var b = new Buffer(authArr[1], 'base64');
    var user = _.split(b.toString(), ':');
    authToken = _.get(user, '1');
  } else {
    console.log('default');
    authType = 2;
    authToken = _.trim(_.trimStart(_.get(req, 'query.access_token', null)));
  }
  if (authType == 1) {
    console.log('auth type 1 ==> checkAuthToken');
    checkAuthToken(authToken)
    .then((users) => {
      req.users = users;
      next();
      return users;
    })
    .catch((e) => {
      if (e instanceof AppError.AppError) {
        res.status(e.status || 404).send(e.message);
      } else {
        next(e);
      }
    });
  } else if (authType == 2) {
    console.log('auth type 2 ==> checkAccessToken');
    checkAccessToken(authToken)
    .then((users) => {
      req.users = users;
      next();
      return users;
    })
    .catch((e) => {
      if (e instanceof AppError.AppError) {
        res.status(e.status || 404).send(e.message);
      } else {
        next(e);
      }
    });
  } else {
    res.send(new AppError.Unauthorized(`Auth type not supported.`));
  }
};
