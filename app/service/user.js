"use strict";

const Service = require("egg").Service;

class UserService extends Service {
  async getUserByName(username) {
    const { app } = this;
    console.log(app.mysql);
    try {
      const result = await app.mysql.get("user", { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async register(params) {
    const { app } = this;
    // console.log(app.mysql);
    try {
      const result = await app.mysql.insert("user", params);
      return result;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async editUserInfo(params) {
    const { app } = this;
    try {
      const result = await app.mysql.update(
        "user",
        { ...params },
        {
          id: params.id,
        }
      );
      return result;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async modifyPass(params) {
    const { ctx, app } = this;
    try {
      let result = await app.mysql.update(
        "user",
        {
          ...params,
        },
        {
          id: params.id,
        }
      );
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = UserService;
