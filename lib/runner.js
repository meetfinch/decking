var async;

async = require("async");

module.exports = {
  getArg: function(key, val, container, done) {
    var alias, arg, host, iterator, k, matches, path, remote, v, _i, _j, _k, _len, _len1, _len2, _ref;
    arg = [];
    switch (key) {
      case "env":
        iterator = function(v, callback) {
          var options, value, _ref;
          _ref = v.split("="), key = _ref[0], value = _ref[1];
          if (value === "-") {
            value = process.env[key];
          }
          if (value) {
            arg = [].concat(arg, ["-e " + key + "=" + value]);
            return callback(null);
          }
          options = {
            prompt: "" + container.name + " requires a value for the env var '" + key + "':",
            silent: true,
            replace: "*"
          };
          return require("read")(options, function(err, value) {
            arg = [].concat(arg, ["-e " + key + "=" + value]);
            return callback(null);
          });
        };
        return async.eachSeries(val, iterator, function(err) {
          return done(err, arg);
        });
      case "dependencies":
        for (k = _i = 0, _len = val.length; _i < _len; k = ++_i) {
          v = val[k];
          if (container.group) {
            v += "." + container.group;
          }
          alias = container.object.aliases[k];
          arg = [].concat(arg, ["--link " + v + ":" + alias]);
        }
        break;
      case "port":
        for (_j = 0, _len1 = val.length; _j < _len1; _j++) {
          v = val[_j];
          arg = [].concat(arg, ["-p " + v]);
        }
        break;
      case "privileged":
        if (val) {
          arg = ["-privileged"];
        }
        break;
      case "mount":
        for (_k = 0, _len2 = val.length; _k < _len2; _k++) {
          v = val[_k];
          _ref = v.split(":"), host = _ref[0], remote = _ref[1];
          matches = host.match(/^\.(.*)$/);
          if (matches) {
            path = require("path");
            host = path.join(process.cwd(), matches[1]);
          }
          if (host === ".") {
            host = process.cwd();
          }
          arg = [].concat(arg, ["-v " + host + ":" + remote]);
        }
        break;
      case "image":
      case "extra":
        arg = [val];
        break;
      default:
        return done(new Error("Unknown argument " + key));
    }
    return done(null, arg);
  },
  sortArgs: function(object) {
    var key, order, sorted, _i, _len;
    order = ["env", "dependencies", "port", "privileged", "mount", "image", "extra"];
    sorted = {};
    for (_i = 0, _len = order.length; _i < _len; _i++) {
      key = order[_i];
      if (object[key]) {
        sorted[key] = object[key];
      }
    }
    return sorted;
  },
  formatArgs: function(name, args) {
    var arg, cmdArgs, _i, _len;
    cmdArgs = ["docker", "run", "-d", "--name", "" + name];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      cmdArgs = cmdArgs.concat(arg);
    }
    return cmdArgs.join(" ");
  }
};