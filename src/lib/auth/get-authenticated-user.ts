import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthenticatedUser = {
  userId: string;
  email: string;
  name: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const name = user?.fullName ?? (fullName || user?.username || null);

  return {
    userId,
    email: primaryEmail,
    name,
  };
}
