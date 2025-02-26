import { ServiceBroker } from "moleculer";
import DBService from "moleculer-db";
import MongooseDBAdaptor from "moleculer-db-adapter-mongoose";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import user from "../models/user.js";
import ApiGateway from "moleculer-web";

const broker = new ServiceBroker();

broker.createService({
  name: "users",
  mixins: [DBService, ApiGateway],
  adapter: new MongooseDBAdaptor(process.env.DB_URL),
  model: user,
  settings: {
    fields: ["_id", "name", "email", "password", "createdAt"],
    entityValidator: {
      name: { type: "string" },
      email: { type: "email" },
      password: { type: "string", min: 8 },
    },
    routes: [
      {
        path: "/users",
        aliases: {
          "GET /users": "users.findAll",
          "GET /users/:id": "users.findOne",
          "POST /users": "users.create",
          "PUT /users/:id": "users.update",
          "DELETE /users/:id": "users.delete",
        },
      },
    ],
  },
  actions: {
    create: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        let entity = ctx.params.user;
        await this.validateEntity(entity);

        if (entity.email) {
          const found = await this.adapter.findOne({ email: entity.email });
          if (found) {
            return Promise.reject(
              new MoleculerClientError("Email exists!", 422, "Email exists!", [
                { field: "email", message: "Email Exists" },
              ])
            );
          }
        }
        entity.password = bcrypt.hashSync(entity.password, 10);
        entity.createdAt = new Date();
        const doc = await this.adapter.insert(entity);
        const user = await this.transformDocuments(ctx, {}, doc);
        return this.entityChanged("created", user, ctx).then(() => user);
      },
    },

    findAll: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        return await this.adapter.find(ctx.params.id);
      },
    },

    findOne: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        return await this.adapter.findById(ctx.params.id);
      },
    },

    update: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        return await this.adapter.updateById(ctx.params.id, {
          $set: ctx.params.user,
        });
      },
    },

    delete: {
      params: {
        user: { type: "object" },
      },
      async handler(ctx) {
        return await this.adapter.removeById(ctx.params.id);
      },
    },
  },
});

broker.start();

export default broker;
