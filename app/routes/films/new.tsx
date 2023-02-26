import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { createFilm } from "~/models/film.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const synopsis = formData.get("synopsis");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", synopsis: null } },
      { status: 400 }
    );
  }

  if (typeof synopsis !== "string" || synopsis.length === 0) {
    return json(
      { errors: { synopsis: "Synopsis is required", title: null } },
      { status: 400 }
    );
  }

  const film = await createFilm({ title, synopsis, userId });

  return redirect(`/films/${film.id}`);
}

export default function NewFilmsPage() {
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
            placeholder="Back to the future"
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
          <span>Synopsis: </span>
          <textarea
            name="synopsis"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            placeholder="A young man disrupts history when an aging scientist sends him to the past"
            aria-invalid={actionData?.errors?.synopsis ? true : undefined}
            aria-errormessage={
              actionData?.errors?.synopsis ? "synopsis-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.synopsis && (
          <div className="pt-1 text-red-700" id="synopsis-error">
            {actionData.errors.synopsis}
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
