"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn btn-ghost btn-sm"
      title="Se déconnecter"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
