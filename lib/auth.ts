import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "PROFESSIONAL";

export interface CurrentUser {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: UserRole;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: user.role as UserRole,
  };
}

export async function getCurrentUserOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

/**
 * Sync user from Clerk to database
 * This should be called from webhook handlers
 */
export async function syncUserFromClerk() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (existingUser) {
    return await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });
  }

  return await prisma.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: "PROFESSIONAL",
    },
  });
}
