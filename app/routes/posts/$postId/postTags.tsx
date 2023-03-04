import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Modal from "~/components/modal";
import { Tag } from "~/components/tag";
import { TagList } from "~/components/tag_list";
import { prisma } from "~/db.server";
import { findOrCreateTag, maybeTagPost } from "~/models/tag.server";
import { XMarkIcon } from '@heroicons/react/24/solid'

export async function loader({ params }: LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) throw new Response("Not found", { status: 404 });

  return json({ post, postTags: post.tags.map((tag) => tag.tag) });
}

export async function action({ request, params }: ActionArgs) {
  const form = await request.formData();
  const title = form.get("title");

  if (!params.postId) throw new Response("Not found", { status: 404 });

  if (typeof title !== "string" || title.length === 0) {
    return json({ errors: { title: "must be provided" } }, { status: 400 });
  }

  const tag = await findOrCreateTag({ title: title });

  await maybeTagPost({ postId: params.postId, tagId: tag.id });

  return redirect(
    `/posts/${params["postId"]}/postTags?${new URLSearchParams([
      ["newTag", tag.slug],
    ])}`
  );
}

export default function PostTags() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tagInputEl = useRef<HTMLInputElement>(null);

  const newTag = searchParams.get("newTag");

  useEffect(() => {
    if (tagInputEl.current == null) return
    if (typeof newTag == 'string' ) {
      tagInputEl.current.value = ''
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleExitComplete = () => {
    navigate(`/posts/${data.post.id}`, { replace: true });
  };

  const handleDismiss = () => {
    setIsModalOpen(false);
  };

  const tagClass = (
    tagSlug: string,
    tagSlugFromParam: string | null
  ): string => {
    if (typeof tagSlugFromParam != "string") return "";

    if (tagSlugFromParam == tagSlug) {
      return " animate-wiggle-once";
    } else {
      return "";
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isModalOpen && (
        <Modal title="Manage Tags" onDismiss={handleDismiss}>
          <TagList className="mb-2">
            {data.postTags.map((tag) => (
              <Tag
                key={tag.id}
                id={tag.slug}
                className={tagClass(tag.slug, newTag)}
              >
                <span className="flex items-center">
                  <span className="mr-1">{tag.title}</span>
                  <Form method="post" className="h-full">
                    <input type="hidden" name="intent" value="delete"/>
                    <input type="hidden" name="tagId" value={tag.id}/>
                    <button
                      type="submit"
                      className="h-full bg-transparent hover:text-underline"
                    >
                      <span className="sr-only">Delete</span><span aria-hidden="true"><XMarkIcon className="w-2 h-2 text-black"/></span>
                    </button>

                  </Form>
                </span>
              </Tag>
            ))}
          </TagList>
          <Form method="post" className="space-y-2">
            <div>
              <label className="flex w-full flex-col gap-1">
                <span className="sr-only">Title:</span>
                <input
                  ref={tagInputEl}
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
            <button
              type="submit"
              className="w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Add tag
            </button>
          </Form>
        </Modal>
      )}
    </AnimatePresence>
  );
}
