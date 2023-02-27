import { Form, useActionData, useLoaderData, useMatches } from "@remix-run/react";
import {ActionArgs, json, LoaderArgs, redirect} from "@remix-run/server-runtime";
import {prisma} from "~/db.server";

export async function loader({params}: LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId
    },
    include: { tags: { include: { tag: true } } }
  })

  if (!post) throw new Response("Not found", { status: 404 })

  return json({post, postTags: post.tags.map((tag) => tag.tag)})
}

export async function action({request, params}: ActionArgs) {
  const form = await request.formData();
  const title = form.get('title');

  if (!params.postId) throw new Response("Not found", { status: 404 })

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "must be provided"  } },
      { status: 400 }
    );
  }

  const slug = title.toLowerCase();
  const tag = await prisma.tag.upsert({
    create: {
      title: title,
      slug: slug,
    },
    update: {},
    where: {
      slug: slug,
    }
  })

  const post = await prisma.postTags.upsert({
    where: {
      postId_tagId: {
        postId: params.postId,
        tagId: tag.id,
      },
    },
    create: {
      tagId: tag.id,
      postId: params.postId
    },
    update: {},
  })

  return redirect(`/posts/${params.postId}/postTags`)
}

export default function PostTags() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mt-4 mb-2 text-xl">Tags</h1>
      <ul>
      {data.postTags.map((tag) => (
        <li>
          {tag.title}
        </li>
      ))}
      </ul>
      <Form method="post">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="sr-only">Title:</span>
            <input
              name="title"
              type="text"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              placeholder="Family friendly"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.title && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.title}
            </div>
          )}
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Add tag
          </button>
        </div>
      </Form>
    </div>
  )
}
