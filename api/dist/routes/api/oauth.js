'use strict';

var oauth2orize = require('oauth2orize');
var uid = require('uid');
var crypto = require('crypto');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var keystone = require('keystone');

var App = keystone.list('App'),
    AccessToken = keystone.list('AccessToken');

var server = oauth2orize.createServer();

server.exchange(oauth2orize.exchange.clientCredentials(function (client, scope, done) {
  var token = uid(256);
  var tokenHash = crypto.createHash('sha1').update(token).digest('hex');
  var expiresIn = 1800;
  var expirationDate = new Date(new Date().getTime() + expiresIn * 1000);

  var accessToken = AccessToken.model({
    token: tokenHash,
    expirationDate: expirationDate,
    client: client.id,
    scope: scope
  });

  accessToken.save(function (err, savedAccessToken) {
    if (err) {
      return done(err);
    }

    return done(null, token, { expires_in: expiresIn });
  });
}));

passport.use('clientBasic', new BasicStrategy(function (clientId, clientSecret, done) {
  App.model.findById(clientId).exec(function (err, app) {
    if (err) {
      return done(err);
    }
    if (!app) {
      return done(null, false);
    }

    if (clientSecret === app.secret) {
      return done(null, app);
    }

    return done(null, false);
  });
}));

passport.use('clientPassword', new ClientPasswordStrategy(function (clientId, clientSecret, done) {
  App.model.findById(clientId).exec(function (err, app) {
    if (err) {
      return done(err);
    }
    if (!app) {
      return done(null, false);
    }

    if (app.secret === clientSecret) {
      return done(null, app);
    } else {
      return done(null, false);
    }
  });
}));

/**
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).
 */
passport.use('accessToken', new BearerStrategy(function (accessToken, done) {
  var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex');

  AccessToken.model.findOne({ token: accessTokenHash }, function (findErr, token) {
    if (findErr) {
      return done(findErr);
    }
    if (!token) {
      return done(null, false);
    }
    if (new Date() > token.expirationDate) {
      return token.remove(function (removeErr) {
        return done(removeErr);
      });
    } else {
      return App.model.findById(token.client).exec(function (err, app) {
        if (err) {
          return done(err);
        }
        if (!app) {
          return done(null, false);
        }
        // no use of scopes for now
        var info = { scope: '*' };

        return done(null, app, info);
      });
    }
  });
}));

exports.checkAccessToken = function (req, res, next) {
  passport.authenticate('accessToken', { session: false })(req, res, next);
};

exports.token = [passport.authenticate(['clientBasic', 'clientPassword'], { session: false }), server.token(), server.errorHandler()];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXBpL29hdXRoLmpzIl0sIm5hbWVzIjpbIm9hdXRoMm9yaXplIiwicmVxdWlyZSIsInVpZCIsImNyeXB0byIsInBhc3Nwb3J0IiwiQmFzaWNTdHJhdGVneSIsIkNsaWVudFBhc3N3b3JkU3RyYXRlZ3kiLCJTdHJhdGVneSIsIkJlYXJlclN0cmF0ZWd5Iiwia2V5c3RvbmUiLCJBcHAiLCJsaXN0IiwiQWNjZXNzVG9rZW4iLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJleGNoYW5nZSIsImNsaWVudENyZWRlbnRpYWxzIiwiY2xpZW50Iiwic2NvcGUiLCJkb25lIiwidG9rZW4iLCJ0b2tlbkhhc2giLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZGlnZXN0IiwiZXhwaXJlc0luIiwiZXhwaXJhdGlvbkRhdGUiLCJEYXRlIiwiZ2V0VGltZSIsImFjY2Vzc1Rva2VuIiwibW9kZWwiLCJpZCIsInNhdmUiLCJlcnIiLCJzYXZlZEFjY2Vzc1Rva2VuIiwiZXhwaXJlc19pbiIsInVzZSIsImNsaWVudElkIiwiY2xpZW50U2VjcmV0IiwiZmluZEJ5SWQiLCJleGVjIiwiYXBwIiwic2VjcmV0IiwiYWNjZXNzVG9rZW5IYXNoIiwiZmluZE9uZSIsImZpbmRFcnIiLCJyZW1vdmUiLCJyZW1vdmVFcnIiLCJpbmZvIiwiZXhwb3J0cyIsImNoZWNrQWNjZXNzVG9rZW4iLCJyZXEiLCJyZXMiLCJuZXh0IiwiYXV0aGVudGljYXRlIiwic2Vzc2lvbiIsImVycm9ySGFuZGxlciJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxjQUFjQyxRQUFRLGFBQVIsQ0FBbEI7QUFDQSxJQUFJQyxNQUFNRCxRQUFRLEtBQVIsQ0FBVjtBQUNBLElBQUlFLFNBQVNGLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFBSUcsV0FBV0gsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFJSSxnQkFBZ0JKLFFBQVEsZUFBUixFQUF5QkksYUFBN0M7QUFDQSxJQUFJQyx5QkFBeUJMLFFB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Q0FBUDtBQUNELE9BWE0sQ0FBUDtBQVlEO0FBQ0YsR0F2QkQ7QUF3QkQsQ0EzQjJCLENBQTVCOztBQTZCQUMsUUFBUUMsZ0JBQVIsR0FBMkIsVUFBU0MsR0FBVCxFQUFjQyxHQUFkLEVBQW1CQyxJQUFuQixFQUF5QjtBQUNsRGpELFdBQVNrRCxZQUFULENBQXNCLGFBQXRCLEVBQXFDLEVBQUVDLFNBQVMsS0FBWCxFQUFyQyxFQUF5REosR0FBekQsRUFBOERDLEdBQTlELEVBQW1FQyxJQUFuRTtBQUNELENBRkQ7O0FBSUFKLFFBQVE3QixLQUFSLEdBQWdCLENBQ2RoQixTQUFTa0QsWUFBVCxDQUFzQixDQUFDLGFBQUQsRUFBZ0IsZ0JBQWhCLENBQXRCLEVBQXlELEVBQUVDLFNBQVMsS0FBWCxFQUF6RCxDQURjLEVBRWQxQyxPQUFPTyxLQUFQLEVBRmMsRUFHZFAsT0FBTzJDLFlBQVAsRUFIYyxDQUFoQiIsImZpbGUiOiJvYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBvYXV0aDJvcml6ZSA9IHJlcXVpcmUoJ29hdXRoMm9yaXplJyk7XG52YXIgdWlkID0gcmVxdWlyZSgndWlkJyk7XG52YXIgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG52YXIgcGFzc3BvcnQgPSByZXF1aXJlKCdwYXNzcG9ydCcpO1xudmFyIEJhc2ljU3RyYXRlZ3kgPSByZXF1aXJlKCdwYXNzcG9ydC1odHRwJykuQmFzaWNTdHJhdGVneTtcbnZhciBDbGllbnRQYXNzd29yZFN0cmF0ZWd5ID0gcmVxdWlyZSgncGFzc3BvcnQtb2F1dGgyLWNsaWVudC1wYXNzd29yZCcpLlN0cmF0ZWd5O1xudmFyIEJlYXJlclN0cmF0ZWd5ID0gcmVxdWlyZSgncGFzc3BvcnQtaHR0cC1iZWFyZXInKS5TdHJhdGVneTtcbnZhciBrZXlzdG9uZSA9IHJlcXVpcmUoJ2tleXN0b25lJyk7XG5cbnZhciBBcHAgPSBrZXlzdG9uZS5saXN0KCdBcHAnKSxcbiAgQWNjZXNzVG9rZW4gPSBrZXlzdG9uZS5saXN0KCdBY2Nlc3NUb2tlbicpO1xuXG52YXIgc2VydmVyID0gb2F1dGgyb3JpemUuY3JlYXRlU2VydmVyKCk7XG5cbnNlcnZlci5leGNoYW5nZShvYXV0aDJvcml6ZS5leGNoYW5nZS5jbGllbnRDcmVkZW50aWFscyhmdW5jdGlvbihjbGllbnQsIHNjb3BlLCBkb25lKSB7XG4gIHZhciB0b2tlbiA9IHVpZCgyNTYpO1xuICB2YXIgdG9rZW5IYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUodG9rZW4pLmRpZ2VzdCgnaGV4Jyk7XG4gIHZhciBleHBpcmVzSW4gPSAxODAwO1xuICB2YXIgZXhwaXJhdGlvbkRhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLmdldFRpbWUoKSArIChleHBpcmVzSW4gKiAxMDAwKSk7XG5cbiAgdmFyIGFjY2Vzc1Rva2VuID0gQWNjZXNzVG9rZW4ubW9kZWwoe1xuICAgIHRva2VuOiB0b2tlbkhhc2gsXG4gICAgZXhwaXJhdGlvbkRhdGU6IGV4cGlyYXRpb25EYXRlLFxuICAgIGNsaWVudDogY2xpZW50LmlkLFxuICAgIHNjb3BlOiBzY29wZSxcbiAgfSk7XG5cbiAgYWNjZXNzVG9rZW4uc2F2ZSgoZXJyLCBzYXZlZEFjY2Vzc1Rva2VuKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9uZShudWxsLCB0b2tlbiwge2V4cGlyZXNfaW46IGV4cGlyZXNJbn0pO1xuICB9KTtcbn0pKTtcblxucGFzc3BvcnQudXNlKCdjbGllbnRCYXNpYycsIG5ldyBCYXNpY1N0cmF0ZWd5KChjbGllbnRJZCwgY2xpZW50U2VjcmV0LCBkb25lKSA9PiB7XG4gIEFwcC5tb2RlbC5maW5kQnlJZChjbGllbnRJZCkuZXhlYygoZXJyLCBhcHApID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgIH1cbiAgICBpZiAoIWFwcCkge1xuICAgICAgcmV0dXJuIGRvbmUobnVsbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGlmIChjbGllbnRTZWNyZXQgPT09IGFwcC5zZWNyZXQpIHtcbiAgICAgIHJldHVybiBkb25lKG51bGwsIGFwcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbmUobnVsbCwgZmFsc2UpO1xuICB9KTtcbn0pKTtcblxucGFzc3BvcnQudXNlKCdjbGllbnRQYXNzd29yZCcsIG5ldyBDbGllbnRQYXNzd29yZFN0cmF0ZWd5KChjbGllbnRJZCwgY2xpZW50U2VjcmV0LCBkb25lKSA9PiB7XG4gIEFwcC5tb2RlbC5maW5kQnlJZChjbGllbnRJZCkuZXhlYygoZXJyLCBhcHApID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgIH1cbiAgICBpZiAoIWFwcCkge1xuICAgICAgcmV0dXJuIGRvbmUobnVsbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGlmIChhcHAuc2VjcmV0ID09PSBjbGllbnRTZWNyZXQpIHtcbiAgICAgIHJldHVybiBkb25lKG51bGwsIGFwcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb25lKG51bGwsIGZhbHNlKTtcbiAgICB9XG4gIH0pO1xufSkpO1xuXG4vKipcbiAqIFRoaXMgc3RyYXRlZ3kgaXMgdXNlZCB0byBhdXRoZW50aWNhdGUgdXNlcnMgYmFzZWQgb24gYW4gYWNjZXNzIHRva2VuIChha2EgYVxuICogYmVhcmVyIHRva2VuKS5cbiAqL1xucGFzc3BvcnQudXNlKCdhY2Nlc3NUb2tlbicsIG5ldyBCZWFyZXJTdHJhdGVneSgoYWNjZXNzVG9rZW4sIGRvbmUpID0+IHtcbiAgdmFyIGFjY2Vzc1Rva2VuSGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGExJykudXBkYXRlKGFjY2Vzc1Rva2VuKS5kaWdlc3QoJ2hleCcpO1xuXG4gIEFjY2Vzc1Rva2VuLm1vZGVsLmZpbmRPbmUoe3Rva2VuOiBhY2Nlc3NUb2tlbkhhc2h9LCAoZmluZEVyciwgdG9rZW4pID0+IHtcbiAgICBpZiAoZmluZEVycikge1xuICAgICAgcmV0dXJuIGRvbmUoZmluZEVycik7XG4gICAgfVxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHJldHVybiBkb25lKG51bGwsIGZhbHNlKTtcbiAgICB9XG4gICAgaWYgKG5ldyBEYXRlKCkgPiB0b2tlbi5leHBpcmF0aW9uRGF0ZSkge1xuICAgICAgcmV0dXJuIHRva2VuLnJlbW92ZSgocmVtb3ZlRXJyKSA9PiBkb25lKHJlbW92ZUVycikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQXBwLm1vZGVsLmZpbmRCeUlkKHRva2VuLmNsaWVudCkuZXhlYygoZXJyLCBhcHApID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhcHApIHtcbiAgICAgICAgICByZXR1cm4gZG9uZShudWxsLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBubyB1c2Ugb2Ygc2NvcGVzIGZvciBub3dcbiAgICAgICAgdmFyIGluZm8gPSB7IHNjb3BlOiAnKicgfTtcblxuICAgICAgICByZXR1cm4gZG9uZShudWxsLCBhcHAsIGluZm8pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KVxufSkpO1xuXG5leHBvcnRzLmNoZWNrQWNjZXNzVG9rZW4gPSBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICBwYXNzcG9ydC5hdXRoZW50aWNhdGUoJ2FjY2Vzc1Rva2VuJywgeyBzZXNzaW9uOiBmYWxzZSB9KShyZXEsIHJlcywgbmV4dCk7XG59XG5cbmV4cG9ydHMudG9rZW4gPSBbXG4gIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZShbJ2NsaWVudEJhc2ljJywgJ2NsaWVudFBhc3N3b3JkJ10sIHsgc2Vzc2lvbjogZmFsc2UgfSksXG4gIHNlcnZlci50b2tlbigpLFxuICBzZXJ2ZXIuZXJyb3JIYW5kbGVyKCksXG5dXG4iXX0=