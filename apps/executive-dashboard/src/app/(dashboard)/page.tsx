import { redirect } from "next/navigation";

/**
 * Root page — redirects to Command Center.
 *
 * The Command Center is the primary intelligence view
 * showing live KPIs, alerts, scenarios, and decisions.
 */
export default function RootPage() {
  redirect("/command-center");
}
