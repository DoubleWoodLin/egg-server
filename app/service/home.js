"use strict";

const Service = require("egg").Service;

class HomeService extends Service {
  async user() {
    return {
      name: "jarvey",
      slogan: "everyday everynight",
    };
  }
}

module.exports = HomeService;
