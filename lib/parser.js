module.exports = {
  load: function(config) {
    var alias, container, dep, dependency, details, err, i, index, matches, name, _, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
    if (!Object.keys(config.containers || {}).length) {
      throw new Error("No containers defined!");
    }
    if (!Object.keys(config.clusters || {}).length) {
      throw new Error("No clusters defined!");
    }
    if (!Object.keys(config.groups || {}).length) {
      config.groups = {};
    }
    if (!Object.keys(config.images || {}).length) {
      config.images = {};
    }
    _ref = config.containers;
    for (name in _ref) {
      details = _ref[name];
      if (typeof details === "string") {
        details = config.containers[name] = {
          image: details
        };
      }
      if (details.dependencies == null) {
        details.dependencies = [];
      }
      details.aliases = [];
      _ref1 = details.dependencies;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        dependency = _ref1[i];
        _ref2 = dependency.split(":"), dep = _ref2[0], alias = _ref2[1];
        if (!alias) {
          alias = dep;
        }
        if (config.containers[dep] == null) {
          err = "Dependency '" + dep + "' of container '" + name + "' does not exist!";
          throw new Error(err);
        }
        details.dependencies[i] = dep;
        details.aliases[i] = alias;
      }
    }
    _ref3 = config.clusters;
    for (name in _ref3) {
      details = _ref3[name];
      if (Array.isArray(details)) {
        details = config.clusters[name] = {
          containers: details
        };
      }
      if (details.group && !config.groups[details.group]) {
        err = "Cluster " + name + " references invalid group " + details.group;
        throw new Error(err);
      }
      if (!details.group && config.groups[name]) {
        details.group = name;
      }
      if (!details.containers.length) {
        throw new Error("Cluster " + name + " is empty");
      }
      _ref4 = details.containers;
      for (index = _j = 0, _len1 = _ref4.length; _j < _len1; index = ++_j) {
        container = _ref4[index];
        if (typeof container === "string") {
          container = details.containers[index] = {
            name: container,
            count: 1
          };
        }
        matches = container.name.match(/(.+)\((\d+)\)$/);
        if (matches) {
          _ = matches[0], container.name = matches[1], container.count = matches[2];
        }
        container.object = config.containers[container.name];
        if (!container.object) {
          throw new Error("Container " + container.name + " does not exist");
        }
      }
    }
    return config;
  }
};