const {
  verifyAccessToken,
  verifyRefreshToken,
  TokenPairs,
} = require("../../utils/jwt");

const User = require("../../models/User");

const checkBearerToken = async (req, res, next) => {
  if (req.headers.authorization) {
    const [method, jwt] = req.headers.authorization.split(" ");

    if (method === "Bearer" && jwt) {
      try {
        const { payload, expired } = await verifyAccessToken(jwt);
        console.log(payload._id, expired);

        const user = await User.findById(payload._id);

        if (user) {
          req.user = user;
          next();
        } else {
          res.status(401).send("Access Denied: Unauthorized!A");
        }
      } catch (error) {
        res.status(401).send("Access Denied: Unauthorized!B");
      }
    } else {
      res.status(401).send("Access Denied: Unauthorized!C");
    }
  } else {
    res.status(401).send("Access Denied: Unauthorized!D");
  }
};

const checkRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  console.log({ refreshToken });
  try {
    const { _id } = await verifyRefreshToken(refreshToken);

    const tokenPairs = await TokenPairs({ _id });

    res.send(tokenPairs);
  } catch (error) {
    console.log(error);
    res.status(401).send("Refresh token is not valid");
  }
};

const isAuthorizedUser = async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    next(res.status(403).send("Unauthorized access"));
  }
};

module.exports = {
  checkBearerToken,
  checkRefreshToken,
  isAuthorizedUser,
};
