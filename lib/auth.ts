import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

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

export function canAccessOwnedResource(
  user: Pick<CurrentUser, "id" | "role">,
  ownerId: string
): boolean {
  return user.role === "ADMIN" || user.id === ownerId;
}

export function assertCanAccessOwnedResource(
  user: Pick<CurrentUser, "id" | "role">,
  ownerId: string,
  forbiddenMessage = "No tienes permiso para realizar esta acción"
) {
  if (!canAccessOwnedResource(user, ownerId)) {
    throw new Error(forbiddenMessage);
  }
}

/**
 * Ensure the Clerk user exists in our database.
 * If not found, creates a new user record automatically.
 */
async function ensureUserExists(): Promise<CurrentUser> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist, create it from Clerk data
  if (!user) {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      throw new Error("Failed to fetch user from Clerk");
    }

    // Extract role from Clerk metadata if available
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    const role = metadata?.role === "ADMIN" ? Role.ADMIN : Role.PROFESSIONAL;

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role,
      },
    });
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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await ensureUserExists();
  } catch {
    return null;
  }
}

export async function getCurrentUserOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found or not authenticated");
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
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
 * Sync user from Clerk to database (for webhook handlers)
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
      role: Role.PROFESSIONAL,
    },
  });
}
