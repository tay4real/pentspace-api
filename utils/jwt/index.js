const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ISSUER, JWT_AUDIENCE } =
  process.env;

const AccessToken = async (payload) => {
  try {
    const token = await jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: "15m",
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
    return { payload: decoded, expired: null };
  } catch (error) {
    return {
      payload: null,
      expired: error.message.includes("Access Token expired!"),
    };
  }
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, JWT_REFRESH_SECRET);
    return { payload: decoded, expired: null };
  } catch (error) {
    return {
      payload: null,
      expired: error.message.includes("Refresh token expired!"),
    };
  }
};

const authenticate = async (user) => {
  const accessToken = await AccessToken({ _id: user._id });
  const refreshToken = await RefreshToken({ _id: user._id });

  // return them
  return { accessToken, refreshToken };
};

const refresh = async (oldRefreshToken) => {
  try {
    // Verify old refresh token
    const { payload, expired } = await verifyRefreshToken(oldRefreshToken); //  decoded._id

    if (payload) {
      // if everything is ok I can create new access and refresh tokens
      const newAccessToken = await generateAccessToken({ _id: user._id });
      const newRefreshToken = await generateRefreshToken({ _id: user._id });
    } else {
    }

    // replace old refresh token in db with new one
    const newRefreshTokensList = user.refreshTokens
      .filter((token) => token.token !== oldRefreshToken)
      .concat({ token: newRefreshToken });

    user.refreshTokens = [...newRefreshTokensList];
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  authenticate,
  refresh,
  verifyAccessToken,
  verifyRefreshToken,
};
