const { verifyAccessToken } = require("../../utils/jwt");

const User = require("../../models/User");

const authorize = async (req, res, next) => {
  if (req.headers.authorization) {
    const [method, jwt] = req.headers.authorization.split(" ");

    if (method === "Bearer" && jwt) {
      try {
        const { payload, expired } = await verifyAccessToken(jwt);

        const user = await User.findById(payload._id);

        if (user) {
          req.user = user;
          next();
        } else {
          res
            .status(401)
            .json({ error: true, message: "Access Denied: Unauthorized!" });
        }
      } catch (error) {
        res
          .status(401)
          .json({ error: true, message: "Access Denied: Unauthorized!" });
      }
    } else {
      res
        .status(401)
        .json({ error: true, message: "Access Denied: Unauthorized!" });
    }
  } else {
    res
      .status(401)
      .json({ error: true, message: "Access Denied: Unauthorized!" });
  }
};

module.exports = {
  authorize,
};
