const { ACCESS_TOKEN_SECRET } = require("../util/var");
const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // next(new GeneralError("credential invalids", 403));
        return res.status(401).json({
          success: false,
          message: "credential invalids",
        });
      }
      //   const userInfo = decoded;
      //   //   req.email = userInfo.email;
      //   //   req.access_token = token;
      //   //   req.userId = userInfo.userId;

      //   if (userInfo.email) {
      //     req.email = userInfo.email;
      //   }

      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "credential invalids",
    });
  }
}

module.exports = { verifyAccessToken };
