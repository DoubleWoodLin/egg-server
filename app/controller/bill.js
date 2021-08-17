"use strict";

const moment = require("moment");

const Controller = require("egg").Controller;

class BillController extends Controller {
  async add(decode) {
    const { ctx, app } = this;
    const {
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;

    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: "参数错误",
        data: null,
      };
      return;
    }
    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) {
        return;
      }
      user_id = decode.id;
      const result = await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date: date,
        pay_type,
        remark,
        user_id,
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

  async list() {
    const { ctx, app } = this;
    const { page = 1, page_size = 5, type_id = "all", date } = ctx.query;
    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) {
        return;
      }
      user_id = decode.id;
      const list = await ctx.service.bill.list(user_id);
      const _list = list.filter((item) => {
        if (type_id !== "all") {
          return (
            moment(Number(item.date)).format("YYYY-MM") === date &&
            type_id == item.type_id
          );
        }
        return moment(Number(item.date)).format("YYYY-MM") === date;
      });

      let listMap = _list
        .reduce((curr, item) => {
          const date = moment(Number(item.date)).format("YYYY-MM-DD");
          const index = curr.findIndex((item) => item.date === date);
          if (index > -1) {
            curr[index].bills.push(item);
          } else {
            curr.push({
              date,
              bills: [item],
            });
          }
          return curr;
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date));

      const filter_ListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size
      );

      let __list = list.filter(
        (item) => moment(Number(item.date)).format("YYYY-MM") === date
      );

      let totalExpense = __list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount);
        }
        return curr;
      }, 0);

      let totalIncome = __list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
        }
        return curr;
      }, 0);

      ctx.body = {
        code: 200,
        usg: "请求成功",
        data: {
          totalExpense,
          totalIncome,
          totalPage: Math.ceil(listMap.length / page_size),
          list: filter_ListMap || [],
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "系统错误",
        data: null,
      };
    }
  }

  async detail() {
    const { ctx, app } = this;
    const { id = "" } = ctx.query;
    let user_id;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) {
      return;
    }
    user_id = decode.id;
    if (!id) {
      ctx.body = {
        code: 500,
        msg: "账单id不能为空",
        data: null,
      };
      return;
    }
    try {
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: "请求成功",
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: "系统错误",
        data: null,
      };
    }
  }

  async update() {
    const { ctx, app } = this;
    // 账单的相关参数，这里注意要把账单的 id 也传进来
    const {
      id,
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;
    // 判空处理
    if (!id || !amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: "参数错误",
        data: null,
      };
      return;
    }
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) {
      return;
    }
    let user_id = decode.id;
    try {
      const result = await ctx.service.bill.update({
        id, // 账单 id
        amount, // 金额
        type_id, // 消费类型 id
        type_name, // 消费类型名称
        date: date, // 日期
        pay_type, // 消费类型
        remark, // 备注
        user_id, // 用户 id
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

  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    if (!id) {
      ctx.body = {
        code: 400,
        msg: "参数错误",
        data: null,
      };
      return;
    }

    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      user_id = decode.id;
      const result = await ctx.service.bill.delete(id, user_id);
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

  async data() {
    const { ctx, app } = this;
    const { date } = ctx.query;
    let user_id;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    user_id = decode.id;
    try {
      const result = await ctx.service.bill.list(user_id);
      // 根据时间参数，筛选出当月所有的账单数据
      const start = moment(date).startOf("month").unix() * 1000; // 选择月份，月初时间
      const end = moment(date).endOf("month").unix() * 1000; // 选择月份，月末时间
      const _data = result.filter(
        (item) => Number(item.date) > start && Number(item.date) < end
      );
      const total_expense = _data.reduce((arr, cur) => {
        if (cur.pay_type == 1) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);
      const total_income = _data.reduce((arr, cur) => {
        if (cur.pay_type == 2) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);

      let total_data = _data.reduce((arr, cur) => {
        const index = arr.findIndex((item) => item.type_id == cur.type_id);
        if (index == -1) {
          arr.push({
            type_id: cur.type_id,
            type_name: cur.type_name,
            pay_type: cur.pay_type,
            number: Number(cur.amount),
          });
        }
        if (index > -1) {
          arr[index].number += Number(cur.amount);
        }
        return arr;
      }, []);

      total_data = total_data.map((item) => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });

      ctx.body = {
        code: 200,
        msg: "请求成功",
        data: {
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
          total_data: total_data || [],
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "系统错误",
        data: null,
      };
    }
  }
}

module.exports = BillController;
