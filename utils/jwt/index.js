const jwt = require("jsonwebtoken");

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ISSUER, JWT_AUDIENCE } =
  process.env;

const AccessToken = async (payload) => {
  try {
    const token = await jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: "5s",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const RefreshToken = async (payload) => {
  try {
    const token = await jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "1w",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const verifyAccessToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, JWT_ACCESS_SECRET);
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: error.message.includes("jwt expired!") };
  }
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, JWT_REFRESH_SECRET);
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: error.message.includes("jwt expired!") };
  }
};

const TokenPairs = async (payload) => {
  const accessToken = await AccessToken(payload);
  const refreshToken = await RefreshToken(payload);
  return { accessToken, refreshToken };
};

module.exports = { TokenPairs, verifyRefreshToken, verifyAccessToken };
