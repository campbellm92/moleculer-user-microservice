import { ServiceBroker, Errors } from "moleculer";
import DBService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import bcrypt from "bcrypt";
import user from "../models/user.js";
import ApiGateway from "moleculer-web";
// import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import validatePassword from "../utils/passwordValidator.js";

const broker = new ServiceBroker();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

broker.loadServices(path.join(__dirname, "services"), "*.service.js");

broker.createService({
  name: "users",
  mixins: [DBService, ApiGateway],
  adapter: new MongooseAdapter(process.env.MONGO_URI),
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
        path: "/",
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
        user: {
          type: "object",
          props: {
            name: { type: "string" },
            email: { type: "email" },
            password: { type: "string", min: 8 },
          },
        },
      },
      // pw strength validation?
      async handler(ctx) {
        let entity = ctx.params.user;
        await this.validateEntity(entity);

        const passwordValidation = validatePassword({
          password: entity.password,
        });

        if (passwordValidation !== true) {
          throw new Errors.MoleculerClientError(
            "Password validation failed",
            422,
            "VALIDATION_ERROR",
            passwordValidation
          );
        }

        if (entity.email) {
          const found = await this.adapter.findOne({ email: entity.email });
          if (found) {
            return Promise.reject(
              new Errors.MoleculerClientError(
                "Email exists!",
                422,
                "Email exists!",
                [{ field: "email", message: "Email Exists" }]
              )
            );
          }
        }
        entity.name = entity.name;
        entity.password = bcrypt.hashSync(entity.password, 10);
        entity.createdAt = new Date();
        const doc = await this.adapter.insert(entity);
        const user = await this.transformDocuments(ctx, {}, doc);
        return this.entityChanged("created", user, ctx).then(() => user);
      },
    },

    findAll: {
      async handler(ctx) {
        return await this.adapter.find();
      },
    },

    findOne: {
      params: {
        id: { type: "string" },
      },
      async handler(ctx) {
        return await this.adapter.findById(ctx.params.id);
      },
    },

    findByEmail: {
      params: {
        email: { type: "email" },
      },
      async handler(ctx) {
        return await this.adapter.findOne({ email: ctx.params.email });
      },
    },

    update: {
      params: {
        id: { type: "string" },
        user: {
          type: "object",
          props: {
            name: { type: "string" },
            email: { type: "email" },
            password: { type: "string", min: 8 },
          },
        },
      },
      async handler(ctx) {
        if (ctx.params.user.password) {
          const passwordValidation = validatePassword({
            password: ctx.params.user.password,
          });
          if (passwordValidation !== true) {
            throw new Errors.MoleculerClientError(
              "Password validation failed",
              422,
              "VALIDATION_ERROR",
              passwordValidation
            );
          }
          ctx.params.user.password = bcrypt.hashSync(
            ctx.params.user.password,
            10
          );
        }
        return await this.adapter.updateById(ctx.params.id, {
          $set: ctx.params.user,
        });
      },
    },

    delete: {
      params: {
        id: { type: "string" },
      },
      async handler(ctx) {
        return await this.adapter.removeById(ctx.params.id);
      },
    },
  },
});

broker.start();

export default broker;
