import { createFileRoute } from "@tanstack/react-router";
import { InstagramApp } from "@/components/instagram/InstagramApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <InstagramApp />;
}
