import { User } from "../../db/models/user.js";
import { messages, verifyToken } from "../../utils/index.js";

export const socketAuth = async (socket, next) => {
  try {
    const { authorization } = socket.handshake.auth;
    if (!authorization) {
      return next(new Error("token not found"));
    }
    if (!authorization.startsWith("dash")) {
      return next(new Error("invalid barer key"));
    }
    const token = authorization.split(" ")[1];

    const { id, iat, error } = verifyToken(token);
    if (error) {
      return next(new Error(error.message));
    }

    const userExists = await User.findById(id).populate("friends");
    if (!userExists) {
      return next(new Error(messages.user.notFound));
    }

    if (userExists.isDeleted === true) {
      return next(new Error("account deactivated please login first"));
    }

    if (userExists.deletedAt && userExists.deletedAt.getTime() > iat * 1000) {
      return next(new Error("token is destroyed"));
    }

    socket.authUser = userExists;
    socket.id = userExists.id;
    return next();
  } catch (error) {
    return next(new Error(error.message));
  }
};
