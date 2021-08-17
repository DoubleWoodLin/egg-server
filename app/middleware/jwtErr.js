"use strict";

module.exports = (secret) => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.authorization;
    let decode;
    if (token !== "null" && token) {
      try {
        decode = ctx.app.jwt.verify(token, secret);
        console.log("decode", decode);
        await next();
      } catch (error) {
        console.log(error);
        (ctx.status = 200),
          (ctx.body = {
            code: 401,
            msg: "token已过期，请重新登录",
          });
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: "token不存在",
        data: null,
      };
      return;
    }
  };
};
