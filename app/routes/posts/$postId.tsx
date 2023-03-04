import { CubeIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Form, useCatch, Outlet, Link, useLoaderData } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { Tag } from "~/components/tag";
import { TagList } from "~/components/tag_list";
import { prisma } from "~/db.server";
import { deletePost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export async function loader({ params }: LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: { tags: { include: { tag: true } } },
  });

  if (!post)
    throw new Response(`No post found with ID ${params.postId}`, {
      status: 404,
    });

  return json({ post, postTags: post.tags.map((tag) => tag.tag) });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);

  if (typeof params.postId !== "string") {
    throw new Response(`Can't find post without ID`, { status: 400 });
  }

  await deletePost({ id: params.postId, userId });

  return redirect("/posts");
}

export default function ShowPostPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="max-w-md">
      <h3 className="mb-2 text-2xl font-bold">{data.post.title}</h3>
      {data.post.body && <p className="text-md mb-2">{data.post.body}</p>}
      <div className="mb-4 flex w-full justify-end">
        <Link
          to="edit"
          replace={true}
          className="flex items-center gap-1 rounded border-blue-500 bg-white px-2 py-1 text-xs text-blue-700 hover:underline"
        >
          <IdentificationIcon className="h-3 w-3 stroke-current" />
          Edit title and description
        </Link>
      </div>
      <TagList>
        {data.postTags.map((tag) => (
          <Tag key={tag.id} id={tag.slug}>
            {tag.title}
          </Tag>
        ))}
        <div className="flex w-full justify-end">
          <Link
            to="tags"
            className="flex items-center gap-1 rounded border-blue-500 bg-white px-2 py-1 text-xs text-blue-700 hover:underline"
            replace={true}
          >
            <CubeIcon className="h-3 w-3 stroke-current" />
            Edit tags
          </Link>
        </div>
      </TagList>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-xs text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
      <Outlet />
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404 || caught.status == 400) {
    return (
      <div className="rounded bg-red-100 px-4 py-2 text-sm">{caught.data}</div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
