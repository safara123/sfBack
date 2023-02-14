var jwt = require("jsonwebtoken");

exports.verifyToken = function (req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, "verySecretValue");
    req.decoded = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return true;
};

exports.verifyAdminToken = function (req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, "verySecretValue");
    if (decoded.rol === "admin" || decoded.rol === "supperadmin") {
      req.decoded = decoded;
    } else {
      return res.status(403).send("Invalid Token");
    }
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return true;
};

exports.verifySupperAdminToken = function (req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, "verySecretValue");
    if (decoded.rol === "supperadmin") {
      req.decoded = decoded;
    } else {
      return res.status(403).send("Invalid Token");
    }
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return true;
};


exports.includeInList = function (list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return true;
    }
  }
  return false;
}
