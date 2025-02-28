import { ServiceBroker } from "moleculer";
import { MoleculerError } from "moleculer";
import ApiGatewayService from "moleculer-web";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const broker = new ServiceBroker();

broker.createService({
  name: "auth",
  mixins: ApiGatewayService,
  settings: {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: "*",
      credentials: true,
      maxAge: "24h",
    },
    rateLimit: {
      window: 10 * 1000,
      limit: 10,
      headers: true,
    },
  },
  methods: {
    async authorize(ctx, route, req) {
      let token;
      if (req.headers.authorization) {
        let type = req.headers.authorization.split(" ")[0];
        if (type === "Token") {
          token = req.headers.authorization.split(" ")[1];
        }
      }
      if (!token) {
        throw new UnAuthorizedError("No token provided");
      }
      const user = await ctx.call("auth.resolveToken", { token });

      if (!user) {
        throw new UnAuthorizedError("Invalid token");
      }

      ctx.meta.user = user;
    },
  },
});

broker.start();

export default broker;
