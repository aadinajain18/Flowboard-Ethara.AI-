import prisma from "../prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/AppError";
import type { SignupInput, LoginInput } from "../schemas/auth.schema";

// Colors for random avatar assignment
const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#2563eb",
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Fields to return for user (never return password)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarColor: true,
  lastLoginAt: true,
  createdAt: true,
};

export class AuthService {
  static async signup(input: SignupInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashed = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        avatarColor: randomColor(),
      },
      select: userSelect,
    });

    const token = signToken({ userId: user.id, role: user.role });

    return { user, token };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({ userId: user.id, role: user.role });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }
}
