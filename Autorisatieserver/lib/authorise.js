/**
 * Copyright 2013-present NightWorld.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var pg = require('pg'),
  connString ='pg://postgres:root@localhost:5432/Authorization Server Database';

module.exports = function getBearerToken (req, done) {
  var headerToken = req.get('Authorization'),
    getToken =  req.query.access_token,
    postToken = req.body ? req.body.access_token : undefined;

  // Check exactly one method was used
  var methodsUsed = (headerToken !== undefined) + (getToken !== undefined) +
    (postToken !== undefined);

  if (methodsUsed > 1) {
    return done('invalid_request, only one method may be used to authenticate at a time (Auth header,  ' +
        'GET or POST).', undefined);
  } else if (methodsUsed === 0) {
    return done('invalid_request, the access token was not found', undefined);
  }

  // Header: http://tools.ietf.org/html/rfc6750#section-2.1
  if (headerToken) {
    var matches = headerToken.match(/Bearer\s(\S+)/);

    if (!matches) {
      return done('invalid_request, malformed auth header', undefined);
    }

    headerToken = matches[1];
  }

  // POST: http://tools.ietf.org/html/rfc6750#section-2.2
  if (postToken) {
    if (req.method === 'GET') {
      return done('invalid_request, method cannot be GET When putting the token in the body.', undefined);
    }

    if (!req.is('application/x-www-form-urlencoded')) {
      return done('invalid_request when putting the token in the ' +
        'body, content type must be application/x-www-form-urlencoded.', undefined);
    }
  }

  var bearerToken = headerToken || postToken || getToken;
  console.log("[getBearerToken] Bearertoken: "+ bearerToken);
  done(undefined, bearerToken);
}
