import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/post.server";
import { requireUserId } from "~/session.server";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TagList } from "~/components/tag_list";
import { Tag } from "~/components/tag";
import { getTags } from "~/models/tag.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const postListItems = await getPosts({ userId });
  const tagList = await getTags({ userId });
  return json({ postListItems, tagList });
}

export default function IndexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="max-w-xl">
      {data.postListItems.length === 0 ? null : (
        <ol className="space-y-2">
          {data.postListItems.map((post) => (
            <li
              key={post.id}
              className="rounded border-l-2 border-blue-100 bg-blue-50 text-black hover:bg-blue-100"
            >
              <NavLink
                className={({ isActive }) =>
                  `block border-b px-2 py-2 text-xl ${
                    isActive ? "bg-white" : ""
                  }`
                }
                to={post.id}
              >
                <h2 className="text-md mb-1 font-bold">{post.title}</h2>
                <p className="mr-2 mb-5 text-xs">{post.body}</p>
                <TagList>
                  {post.tags.map((tag) => (
                    <Tag key={tag.tag.id} id={tag.tag.slug}>
                      {tag.tag.title}
                    </Tag>
                  ))}
                </TagList>
              </NavLink>
            </li>
          ))}
        </ol>
      )}
      <div className="flex justify-end">
        <Link
          to="new"
          className="text-md flex items-center p-4 text-blue-500 hover:underline"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>Create a new one</span>
        </Link>
      </div>
      <h2 className="text-md mb-2 font-bold">Tags</h2>
      <TagList className="pb-8">
        {data.tagList.map((tag) => (
          <Tag key={tag.id} id={tag.slug}>
            {`${tag.title} (${tag._count.posts})`}
          </Tag>
        ))}
      </TagList>
    </div>
  );
}
