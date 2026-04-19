import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/http";
import { usersRepository } from "../repositories/users.repository";

const tokenTtl = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret not configured");
  }
  return secret;
}

export type AuthTokenPayload = {
  sub: number;
  iat: number;
  exp: number;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: number) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: tokenTtl });
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === "string" || payload.sub == null) {
      throw new ApiError(401, "Unauthorized");
    }
    const sub = Number(payload.sub);
    if (!Number.isInteger(sub)) {
      throw new ApiError(401, "Unauthorized");
    }
    return {
      sub,
      iat: payload.iat ?? 0,
      exp: payload.exp ?? 0
    } satisfies AuthTokenPayload;
  } catch {
    throw new ApiError(401, "Unauthorized");
  }
}

export const authService = {
  async login(username: string, password: string) {
    const user = await usersRepository.findByUsernameForAuth(username);
    if (!user || !user.passwordHash) {
      throw new ApiError(401, "Invalid credentials");
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = signToken(user.id);
    const { passwordHash, ...publicUser } = user;
    void passwordHash;
    return { token, user: publicUser };
  },

  async me(userId: number) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  },

  async bootstrap(name: string, lastName: string, username: string, email: string, password: string) {
    const countWithPassword = await usersRepository.countWithPassword();
    if (countWithPassword > 0) {
      throw new ApiError(400, "Admin already exists");
    }

    const passwordHash = await hashPassword(password);
    const existing = await usersRepository.findByEmailForAuth(email);
    let user;

    if (existing) {
      if (existing.passwordHash) {
        throw new ApiError(400, "Admin already exists");
      }
      user = await usersRepository.update(existing.id, {
        name,
        lastName,
        username,
        email,
        role: "admin",
        passwordHash
      });
    } else {
      user = await usersRepository.create({
        name,
        lastName,
        username,
        email,
        role: "admin",
        passwordHash
      });
    }

    const token = signToken(user.id);
    return { token, user };
  }
};
