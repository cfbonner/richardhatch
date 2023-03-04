import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import Modal from "~/components/modal";
import { prisma } from "~/db.server";
import { updatePost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export async function loader({ params }: LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) throw new Response("Not found", { status: 404 });

  return json({ post });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const id = params.postId;
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  const post = await updatePost({ id, title, body });

  return redirect(`/posts/${post.id}`);
}

export default function EditPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const handleDismiss = () => {
    navigate(`/posts/${data.post.id}`);
  };

  return (
    <Modal title={`Edit ${data.post.title}`} onDismiss={handleDismiss}>
      <Form method="post" className="space-y-3">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-sm text-blue-600">Title</span>
            <input
              name="title"
              defaultValue={data.post.title}
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
            <span className="text-sm text-blue-600">Description</span>
            <textarea
              name="body"
              defaultValue={data.post.body}
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
            className="w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
    </Modal>
  );
}
