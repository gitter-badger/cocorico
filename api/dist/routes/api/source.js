'use strict';

var config = require('/opt/cocorico/api-web/config.json');

var keystone = require('keystone');
var metafetch = require('metafetch');

var Source = keystone.list('Source'),
    Vote = keystone.list('Vote');

exports.list = function (req, res) {
  if (!config.capabilities.source.read) return res.status(403).send();

  return Vote.model.findById(req.params.voteId).exec(function (findErr, vote) {
    if (findErr) return res.apiError('database error', findErr);

    if (!vote) return res.status(404).apiResponse();

    return Source.model.find({ vote: vote }).populate('likes').sort('-score').exec(function (err, sources) {
      if (err) return res.apiError('database error', err);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var source = _step.value;

          source.likes = LikeHelper.filterUserLikes(source.likes, req.user);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return res.apiResponse({ sources: sources });
    });
  });
};

exports.add = function (req, res) {
  if (!config.capabilities.source.create) return res.status(403).send();

  return Vote.model.findById(req.body.voteId).exec(function (err, vote) {
    if (err) return res.apiError('database error', err);

    if (!vote) return res.status(404).apiResponse();

    return Source.model.findOne({ url: req.body.url, vote: vote }).exec(function (findSourceErr, source) {
      if (findSourceErr) return res.apiError('database error', findSourceErr);

      if (source) return res.status(400).apiResponse({
        error: 'ERROR_SOURCE_ALREADY_EXISTS'
      });

      return metafetch.fetch(decodeURIComponent(req.body.url), {
        flags: { images: false, links: false },
        http: { timeout: 30000 }
      }, function (fetchErr, meta) {
        if (fetchErr) return res.apiError('invalid source URL');

        var newSource = Source.model({
          title: meta.title,
          url: meta.url,
          vote: vote.id,
          description: meta.description,
          image: meta.image,
          type: meta.type
        });

        return newSource.save(function (saveErr) {
          if (saveErr) return res.apiError('database error', saveErr);

          return res.apiResponse({ source: newSource });
        });
      });
    });
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXBpL3NvdXJjZS5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwia2V5c3RvbmUiLCJtZXRhZmV0Y2giLCJTb3VyY2UiLCJsaXN0IiwiVm90ZSIsImV4cG9ydHMiLCJyZXEiLCJyZXMiLCJjYXBhYmlsaXRpZXMiLCJzb3VyY2UiLCJyZWFkIiwic3RhdHVzIiwic2VuZCIsIm1vZGVsIiwiZmluZEJ5SWQiLCJwYXJhbXMiLCJ2b3RlSWQiLCJleGVjIiwiZmluZEVyciIsInZvdGUiLCJhcGlFcnJvciIsImFwaVJlc3BvbnNlIiwiZmluZCIsInBvcHVsYXRlIiwic29ydCIsImVyciIsInNvdXJjZXMiLCJsaWtlcyIsIkxpa2VIZWxwZXIiLCJmaWx0ZXJVc2VyTGlrZXMiLCJ1c2VyIiwiYWRkIiwiY3JlYXRlIiwiYm9keSIsImZpbmRPbmUiLCJ1cmwiLCJmaW5kU291cmNlRXJyIiwiZXJyb3IiLCJmZXRjaCIsImRlY29kZVVSSUNvbXBvbmVudCIsImZsYWdzIiwiaW1hZ2VzIiwibGlua3MiLCJodHRwIiwidGltZW91dCIsImZldGNoRXJyIiwibWV0YSIsIm5ld1NvdXJjZSIsInRpdGxlIiwiaWQiLCJkZXNjcmlwdGlvbiIsImltYWdlIiwidHlwZSIsInNhdmUiLCJzYXZlRXJyIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFNBQVNDLFFBQVEsbUNBQVIsQ0FBYjs7QUFFQSxJQUFJQyxXQUFXRCxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQUlFLFlBQVlGLFFBQVEsV0FBUixDQUFoQjs7QUFFQSxJQUFJRyxTQUFTRixTQUFTRyxJQUFULENBQWMsUUFBZCxDQUFiO0FBQUEsSUFDRUMsT0FBT0osU0FBU0csSUFBVCxDQUFjLE1BQWQsQ0FEVDs7QUFHQUUsUUFBUUYsSUFBUixHQUFlLFVBQVNHLEdBQVQsRUFBY0MsR0FBZCxFQUFtQjtBQUNoQyxNQUFJLENBQUNULE9BQU9VLFlBQVAsQ0FBb0JDLE1BQXBCLENBQTJCQyxJ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SUFBSWEsUUFBSixDQUFhLG9CQUFiLENBQVA7O0FBRUYsWUFBSTJCLFlBQVk3QyxPQUFPVyxLQUFQLENBQWE7QUFDM0JtQyxpQkFBT0YsS0FBS0UsS0FEZTtBQUUzQmIsZUFBS1csS0FBS1gsR0FGaUI7QUFHM0JoQixnQkFBTUEsS0FBSzhCLEVBSGdCO0FBSTNCQyx1QkFBYUosS0FBS0ksV0FKUztBQUszQkMsaUJBQU9MLEtBQUtLLEtBTGU7QUFNM0JDLGdCQUFNTixLQUFLTTtBQU5nQixTQUFiLENBQWhCOztBQVNBLGVBQU9MLFVBQVVNLElBQVYsQ0FBZSxVQUFDQyxPQUFELEVBQWE7QUFDakMsY0FBSUEsT0FBSixFQUNFLE9BQU8vQyxJQUFJYSxRQUFKLENBQWEsZ0JBQWIsRUFBK0JrQyxPQUEvQixDQUFQOztBQUVGLGlCQUFPL0MsSUFBSWMsV0FBSixDQUFnQixFQUFFWixRQUFRc0MsU0FBVixFQUFoQixDQUFQO0FBQ0QsU0FMTSxDQUFQO0FBTUQsT0F6QkksQ0FBUDtBQTJCRCxLQXJDSSxDQUFQO0FBc0NELEdBOUNJLENBQVA7QUErQ0QsQ0FuREQiLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy9vcHQvY29jb3JpY28vYXBpLXdlYi9jb25maWcuanNvbicpO1xuXG52YXIga2V5c3RvbmUgPSByZXF1aXJlKCdrZXlzdG9uZScpO1xudmFyIG1ldGFmZXRjaCA9IHJlcXVpcmUoJ21ldGFmZXRjaCcpO1xuXG52YXIgU291cmNlID0ga2V5c3RvbmUubGlzdCgnU291cmNlJyksXG4gIFZvdGUgPSBrZXlzdG9uZS5saXN0KCdWb3RlJyk7XG5cbmV4cG9ydHMubGlzdCA9IGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG4gIGlmICghY29uZmlnLmNhcGFiaWxpdGllcy5zb3VyY2UucmVhZClcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLnNlbmQoKTtcblxuICByZXR1cm4gVm90ZS5tb2RlbC5maW5kQnlJZChyZXEucGFyYW1zLnZvdGVJZClcbiAgICAuZXhlYygoZmluZEVyciwgdm90ZSkgPT4ge1xuICAgICAgaWYgKGZpbmRFcnIpXG4gICAgICAgIHJldHVybiByZXMuYXBpRXJyb3IoJ2RhdGFiYXNlIGVycm9yJywgZmluZEVycik7XG5cbiAgICAgIGlmICghdm90ZSlcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5hcGlSZXNwb25zZSgpO1xuXG4gICAgICByZXR1cm4gU291cmNlLm1vZGVsLmZpbmQoe3ZvdGUgOiB2b3RlfSlcbiAgICAgICAgLnBvcHVsYXRlKCdsaWtlcycpXG4gICAgICAgIC5zb3J0KCctc2NvcmUnKVxuICAgICAgICAuZXhlYygoZXJyLCBzb3VyY2VzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgIHJldHVybiByZXMuYXBpRXJyb3IoJ2RhdGFiYXNlIGVycm9yJywgZXJyKTtcblxuICAgICAgICAgIGZvciAodmFyIHNvdXJjZSBvZiBzb3VyY2VzKVxuICAgICAgICAgICAgc291cmNlLmxpa2VzID0gTGlrZUhlbHBlci5maWx0ZXJVc2VyTGlrZXMoc291cmNlLmxpa2VzLCByZXEudXNlcik7XG5cbiAgICAgICAgICByZXR1cm4gcmVzLmFwaVJlc3BvbnNlKHsgc291cmNlcyA6IHNvdXJjZXMgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnRzLmFkZCA9IGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG4gIGlmICghY29uZmlnLmNhcGFiaWxpdGllcy5zb3VyY2UuY3JlYXRlKVxuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuc2VuZCgpO1xuXG4gIHJldHVybiBWb3RlLm1vZGVsLmZpbmRCeUlkKHJlcS5ib2R5LnZvdGVJZClcbiAgICAuZXhlYygoZXJyLCB2b3RlKSA9PiB7XG4gICAgICBpZiAoZXJyKVxuICAgICAgICByZXR1cm4gcmVzLmFwaUVycm9yKCdkYXRhYmFzZSBlcnJvcicsIGVycik7XG5cbiAgICAgIGlmICghdm90ZSlcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5hcGlSZXNwb25zZSgpO1xuXG4gICAgICByZXR1cm4gU291cmNlLm1vZGVsLmZpbmRPbmUoe3VybDogcmVxLmJvZHkudXJsLCB2b3RlOiB2b3RlfSlcbiAgICAgICAgLmV4ZWMoKGZpbmRTb3VyY2VFcnIsIHNvdXJjZSkgPT4ge1xuICAgICAgICAgIGlmIChmaW5kU291cmNlRXJyKVxuICAgICAgICAgICAgcmV0dXJuIHJlcy5hcGlFcnJvcignZGF0YWJhc2UgZXJyb3InLCBmaW5kU291cmNlRXJyKTtcblxuICAgICAgICAgIGlmIChzb3VyY2UpXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmFwaVJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgZXJyb3I6ICdFUlJPUl9TT1VSQ0VfQUxSRUFEWV9FWElTVFMnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gbWV0YWZldGNoLmZldGNoKFxuICAgICAgICAgICAgZGVjb2RlVVJJQ29tcG9uZW50KHJlcS5ib2R5LnVybCksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGZsYWdzOiB7IGltYWdlczogZmFsc2UsIGxpbmtzOiBmYWxzZSB9LFxuICAgICAgICAgICAgICBodHRwOiB7IHRpbWVvdXQ6IDMwMDAwIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGZldGNoRXJyLCBtZXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChmZXRjaEVycilcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmFwaUVycm9yKCdpbnZhbGlkIHNvdXJjZSBVUkwnKTtcblxuICAgICAgICAgICAgICB2YXIgbmV3U291cmNlID0gU291cmNlLm1vZGVsKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogbWV0YS50aXRsZSxcbiAgICAgICAgICAgICAgICB1cmw6IG1ldGEudXJsLFxuICAgICAgICAgICAgICAgIHZvdGU6IHZvdGUuaWQsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1ldGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IG1ldGEuaW1hZ2UsXG4gICAgICAgICAgICAgICAgdHlwZTogbWV0YS50eXBlLFxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm4gbmV3U291cmNlLnNhdmUoKHNhdmVFcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZUVycilcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXMuYXBpRXJyb3IoJ2RhdGFiYXNlIGVycm9yJywgc2F2ZUVycik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmFwaVJlc3BvbnNlKHsgc291cmNlOiBuZXdTb3VyY2UgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIl19