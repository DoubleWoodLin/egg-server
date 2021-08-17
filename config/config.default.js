/* eslint valid-jsdoc: "off" */

"use strict";

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1628574750261_7101";

  // add your middleware config here
  config.middleware = [];

  config.cors = {
    origin: "*",
    credentials: true,
    allowMehods: "GET,HEAD,POST,PUT,DELETE,PATCH",
  };
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ["*"],
  };

  config.view = {
    mapping: { ".html": "ejs" },
  };

  config.jwt = {
    secret: "Jarvey",
  };

  config.multipart = {
    mode: "file",
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: "app/public/upload",
  };

  exports.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: "localhost",
      // 端口号
      port: "3306",
      // 用户名
      user: "root",
      // 密码
      password: "jarvey3488329", // Window 用户如果没有密码，可不填写
      // 数据库名
      database: "jarvey-cost",
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  return {
    ...config,
    ...userConfig,
  };
};
