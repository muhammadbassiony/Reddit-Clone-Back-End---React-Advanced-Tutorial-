import { COOKIE_NAME, __prod__ } from "./constants";
import "reflect-metadata";
import "dotenv-safe/config";

import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { sendEmail } from "./utils/sendEmail";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    // url: process.env.DATABASE_URL,
    database: "lireddit2",
    username: "postgres",
    password: "admin",
    logging: true,
    synchronize: true, // false for prod
    entities: [Post, User, Updoot],
  });
  // await conn.runMigrations();

  const app = express();

  // await Post.delete({});

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  // app.set("trust proxy", 1);
  app.use(
    cors({
      // origin: [process.env.CORS_ORIGIN!],
      origin: ["https://studio.apollographql.com", "http://localhost:3001"],
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 yrs
        httpOnly: true,
        sameSite: "lax", //csrf //set to false for apollostudio
        secure: __prod__, // https : in prod only
        // domain: __prod__ ? '':undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
    // plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT!), () => {
    console.log("server started on port 3000");
  });
};

main().catch((err) => console.log(err));
