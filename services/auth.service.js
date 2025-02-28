// should probably separate gateway and auth logic
import { ServiceBroker } from "moleculer";
import { Errors } from "moleculer";
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
    port: 3001,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: "*",
      credentials: true,
    },
    rateLimit: {
      window: 10 * 1000,
      limit: 10,
      headers: true,
    },
    routes: [
      {
        path: "/auth",
        authorization: true,
        aliases: {
          "POST login": "auth.login",
        },
      },
    ],
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
        throw new Errors.MoleculerClientError("No token provided");
      }
      const user = await ctx.call("auth.resolveToken", { token });

      if (!user) {
        throw new Errors.MoleculerClientError("Invalid token");
      }

      ctx.meta.user = user;
    },
  },
  actions: {
    login: {
      params: {
        email: "email",
        password: "string",
      },
      async handler(ctx) {
        const { email, password } = ctx.params;

        const user = await ctx.call("users.findByEmail", { email });

        if (!user) {
          return Promise.reject(
            new Errors.NotFoundError(
              "There is no record for these credentials."
            )
          );
        }

        const matching = await bcrypt.compare(password, user.password);
        if (!matching) {
          return Promise.reject(new Error("Invalid email or password."));
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        return { token, user };
      },
    },

    resolveToken: {
      params: {
        token: "string",
      },
      async handler(ctx) {
        try {
          const decoded = jwt.verify(ctx.params.token, process.env.JWT_SECRET);
          return ctx.call("users.findByEmail", { _id: decoded.id });
        } catch (error) {
          // return Promise.reject(new Error("Invalid token"));
          return null;
        }
      },
    },
  },
});

broker.start();

export default broker;
