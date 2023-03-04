import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getPostListItems } from "~/models/post.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const postListItems = await getPostListItems({ userId });
  return json({ postListItems });
}

export default function PostsPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Lunch spots</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          {data.postListItems.length === 0 ? null : (
            <ol>
              {data.postListItems.map((post) => (
                <li key={post.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={post.id}
                  >
                    {post.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New lunch spot
          </Link>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
