var DepTree, findContainer, hasDependency, sortCluster;

DepTree = require("deptree");

module.exports = {
  resolveContainers: function(config, cluster, callback) {
    var container, containers, dependency, final, group, groupName, i, key, list, originalContainer, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (cluster.group) {
      groupName = cluster.group;
      group = config.groups[groupName];
    }
    containers = [];
    _ref = cluster.containers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      container = _ref[_i];
      _ref1 = container.object.dependencies;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        dependency = _ref1[_j];
        if (!hasDependency(cluster.containers, dependency)) {
          container = {
            name: dependency,
            count: 1,
            object: config.containers[dependency]
          };
          cluster.containers.push(container);
        }
      }
    }
    containers = cluster.containers;
    for (_k = 0, _len2 = containers.length; _k < _len2; _k++) {
      container = containers[_k];
      container.originalName = container.name;
      if (groupName) {
        container.group = groupName;
        container.name += "." + groupName;
        _ref2 = group.options;
        for (key in _ref2) {
          value = _ref2[key];
          container.object[key] = value;
        }
        if (((_ref3 = group.containers) != null ? _ref3[container.originalName] : void 0) != null) {
          _ref4 = group.containers[container.originalName];
          for (key in _ref4) {
            value = _ref4[key];
            container.object[key] = value;
          }
        }
      }
    }
    list = sortCluster(containers);
    final = [];
    for (_l = 0, _len3 = list.length; _l < _len3; _l++) {
      originalContainer = list[_l];
      for (i = _m = 1, _ref5 = originalContainer.count; 1 <= _ref5 ? _m <= _ref5 : _m >= _ref5; i = 1 <= _ref5 ? ++_m : --_m) {
        container = JSON.parse(JSON.stringify(originalContainer));
        container.index = i;
        if (container.count > 1) {
          container.name += "." + i;
        }
        final.push(container);
      }
    }
    return callback(final);
  }
};

sortCluster = function(containers) {
  var container, depTree, item, _i, _j, _len, _len1, _ref, _results;
  depTree = new DepTree;
  for (_i = 0, _len = containers.length; _i < _len; _i++) {
    container = containers[_i];
    depTree.add(container.originalName, container.object.dependencies);
  }
  _ref = depTree.resolve();
  _results = [];
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    item = _ref[_j];
    _results.push(findContainer(containers, item));
  }
  return _results;
};

hasDependency = function(containers, dependency) {
  return findContainer(containers, dependency) !== null;
};

findContainer = function(containers, name) {
  var container, _i, _len;
  for (_i = 0, _len = containers.length; _i < _len; _i++) {
    container = containers[_i];
    if (container.originalName === name || container.name === name) {
      return container;
    }
  }
  return null;
};