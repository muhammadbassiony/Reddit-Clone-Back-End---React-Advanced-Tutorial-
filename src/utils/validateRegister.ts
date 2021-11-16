import { FieldError } from "src/resolvers/FieldError";
import { usernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: usernamePasswordInput) => {
  if (!options.email.includes("@")) {
    const fe: FieldError = {
      field: "email",
      message: "invalid email",
    };
    return fe;
  }

  if (options.username.length <= 2) {
    const fe: FieldError = {
      field: "username",
      message: "length must be greater than 2",
    };
    return fe;
  }

  if (options.username.includes("@")) {
    const fe: FieldError = {
      field: "username",
      message: "cannot include an @",
    };
    return fe;
  }

  if (options.password.length <= 2) {
    const fe: FieldError = {
      field: "password",
      message: "length must be greater than 2",
    };
    return fe;
  }

  return null;
};

export const validateNewPassword = (password: string) => {
  if (password.length <= 2) {
    const fe: FieldError = {
      field: "newPassword",
      message: "length must be greater than 2",
    };
    return fe;
    // return false;
  }
  return null;
};
