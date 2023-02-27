import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { createPost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  const post = await createPost({ title, body, userId, type: 'post' });

  return redirect(`/posts/${post.id}`);
}

export default function NewPostsPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post" className="space-y-3">
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title:</span>
          <input
            name="title"
            type="text"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            placeholder="Where can we get good food?"
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
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            name="body"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            placeholder="A young man disrupts history when an aging scientist sends him to the past"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
