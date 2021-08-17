"use strict";

const Controller = require("egg").Controller;
const defaultAvatar =
  "http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png";

class UserController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: "账号密码不能为空",
        data: null,
      };
      return;
    }
    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: "账号已被注册，请重新输入",
        data: null,
      };
      return;
    }

    const result = await ctx.service.user.register({
      username,
      password,
      avatar: defaultAvatar,
      signature: "世界和平",
    });
    if (result) {
      ctx.body = {
        code: 200,
        msg: "注册成功",
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "注册失败",
        data: null,
      };
    }
  }

  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    const userInfo = await ctx.service.user.getUserByName(username);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: "账号不存在",
        data: null,
      };
      return;
    }
    if (userInfo && userInfo.password !== password) {
      ctx.body = {
        code: 500,
        msg: "账号密码错误",
        data: null,
      };
      return;
    }
    const token = app.jwt.sign(
      {
        id: userInfo.id,
        username: userInfo.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // token 有效期为 24 小时
      },
      app.config.jwt.secret
    );
    ctx.body = {
      code: 200,
      msg: "登陆成功",
      data: {
        token,
      },
    };
  }

  async test() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: "验证成功",
      data: {
        ...decode,
      },
    };
  }

  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    const userInfo = await ctx.service.user.getUserByName(decode.username);
    if (!userInfo) {
      ctx.body = {
        code: 404,
        msg: "用户不存在",
        data: null,
      };
      return;
    }
    ctx.body = {
      code: 200,
      msg: "请求成功",
      data: {
        username: userInfo.username,
        avatar: userInfo.avatar || defaultAvatar,
        signature: userInfo.signature || "",
        id: userInfo.id,
      },
    };
  }

  async editUserInfo() {
    const { ctx, app } = this;
    const { signature = "", avatar = "" } = ctx.request.body;
    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) {
        return;
      }
      user_id = decode.id;
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      const result = ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: "请求成功",
        data: {
          id: user_id,
          signature,
          username: userInfo.username,
          avatar,
        },
      };
    } catch (error) {}
  }

  async modifyPass() {
    const { ctx, app } = this;
    const { old_pass = "", new_pass = "", new_pass2 = "" } = ctx.request.body;

    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      if (decode.username == "admin") {
        ctx.body = {
          code: 400,
          msg: "管理员账户，不允许修改密码！",
          data: null,
        };
        return;
      }
      user_id = decode.id;
      const userInfo = await ctx.service.user.getUserByName(decode.username);

      if (old_pass != userInfo.password) {
        ctx.body = {
          code: 400,
          msg: "原密码错误",
          data: null,
        };
        return;
      }

      if (new_pass != new_pass2) {
        ctx.body = {
          code: 400,
          msg: "新密码不一致",
          data: null,
        };
        return;
      }

      const result = await ctx.service.user.modifyPass({
        ...userInfo,
        password: new_pass,
      });

      ctx.body = {
        code: 200,
        msg: "请求成功",
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: "系统错误",
        data: null,
      };
    }
  }
}

module.exports = UserController;
