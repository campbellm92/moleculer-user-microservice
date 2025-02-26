import { ServiceBroker } from "moleculer";
import DBService from "moleculer-db";
import MongooseDBAdaptor from "moleculer-db-adapter-mongoose";
import dotenv from "dotenv";
dotenv.config();
import user from "../models/user";

const broker = new ServiceBroker();

broker.createService({
  name: "users",
  mixins: [DBService],
  adapter: new MongooseDBAdaptor(process.env.DB_URL),
  model: user,
  actions: {
    create: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        return await this.adapter.insert(ctx.params.user);
      },
    },
    findAll: {
      params: {
        user: { type: "object" },
      },
    },
    async handler(ctx) {
      return await this.adapter.find(ctx.params.id);
    },
    findOne: {
      params: {
        user: { type: "object" },
      },
    },
    async handler(ctx) {
      return await this.adapter.findById(ctx.params.id);
    },
    update: {
      params: {
        user: { type: "object" },
      },
    },
    async handler(ctx) {
      return await this.adapter.updateById(ctx.params.id, {
        $set: ctx.params.user,
      });
    },
    delete: {
      params: {
        user: { type: "object" },
      },
    },
    async handler(ctx) {
      return await this.adapter.removeById(ctx.params.id);
    },
  },
});

export default broker;
