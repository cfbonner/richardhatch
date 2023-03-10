import { Form, Link, NavLink, Outlet } from "@remix-run/react";
import { useUser } from "~/utils";
import Layout from "../components/layout";

export default function PostsPage() {
  const user = useUser();

  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
}
