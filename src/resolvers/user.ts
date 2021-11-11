import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";
import { usernamePasswordInput } from "./usernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { FieldError } from "./FieldError";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    // const user = await em.findOne(User, { username });
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    const userId = req.session.userId;

    if (!userId) {
      //no user logged in
      return null;
    }

    const user = await em.findOne(User, { id: userId });
    return user;
  }

  // ------------------------------------

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: usernamePasswordInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors: [errors] };
    }

    const hashedPassword = await argon2.hash(options.password);
    // const user = await em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    // });

    let user;
    try {
      const [result] = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = result;

      // await em.persistAndFlush(user);
    } catch (err) {
      // console.log(err);
      if (err.code === "23505" || err.detail.includes("already exists")) {
        //duplicate username
        return {
          errors: [
            { field: "usernameOrEmail", message: "username already exists" },
          ],
        };
      }
    }

    // console.log(user);
    req.session.userId = user.id; //log in the user on registration

    return { user };
  }

  // ------------------------------------

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          { field: "usernameOrEmail", message: "this username does not exist" },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "invalid password" }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  // ------------------------------------

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
