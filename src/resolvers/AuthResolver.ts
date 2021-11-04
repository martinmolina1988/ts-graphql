import {
  InputType,
  Field,
  Resolver,
  Query,
  Mutation,
  Arg,
  ID,
  ObjectType,
} from "type-graphql";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

@ObjectType()
class UserType {
  @Field((type) => ID)
  id!: string;
  @Field()
  username!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
}

@InputType()
class UserInput {
  @Field()
  username!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
}

@InputType()
class UserUpdateInput {
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => String, { nullable: true })
  email?: string;
  @Field(() => String, { nullable: true })
  password?: string;
}
@InputType()
class LoginInput {
  @Field(() => String, { nullable: true })
  email!: string;
  @Field(() => String, { nullable: true })
  password!: string;
}

@Resolver()
export class AuthResolver {
  @Mutation(() => String)
  async createUser(@Arg("variables", () => UserInput) variables: UserInput) {
    const { username, email, password } = variables;

    const user: IUser = new User({ username, email, password });
    user.password = await user.encryptPassword(user.password);

    const savedUser = await user.save();
    console.log(savedUser);

    // Creando token
    const token: string = jwt.sign(
      { _id: savedUser._id },
      process.env.TOKEN_SECRET || "tokentest",
      { expiresIn: 60 * 60 * 24 * 30 }
    );
    console.log(token);

    return token;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg("id", () => String) id: any) {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateUser(
    @Arg("id", () => String) id: any,
    @Arg("fields", () => UserUpdateInput) fields: UserUpdateInput
  ) {
    await User.updateOne({ id }, fields);
    return true;
  }

  @Mutation(() => String)
  async login(@Arg("fields", () => LoginInput) fields: LoginInput) {
    const { email, password } = fields;

    const userFound = await User.findOne({ email });
    if (!userFound) throw new Error("Error en el email o contraseña");

    const passwordSucess = await bcrypt.compare(password, userFound.password);
    if (!passwordSucess) throw new Error("Error en el email o contraseña");

    const token: string = jwt.sign(
      { _id: userFound._id },
      process.env.TOKEN_SECRET || "clavesecreta",
      { expiresIn: 60 * 60 * 24 * 30 }
    );

    return token;
  }

  @Query(() => [UserType])
  async users() {
    const userss = await User.find();
    return userss;
  }
}
