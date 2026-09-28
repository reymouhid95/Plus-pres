import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CreateClient from "./CreateClient";

export default async function CreatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/register");

  return <CreateClient />;
}
