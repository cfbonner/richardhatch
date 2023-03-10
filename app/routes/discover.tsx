import {Form, NavLink, Outlet} from "@remix-run/react";
import {json} from "@remix-run/server-runtime";
import {useState} from "react";
import {useLoaderData} from "react-router";
import {Tag} from "~/components/tag";
import {TagList} from "~/components/tag_list";
import {getRandomPost} from "~/models/post.server";
import {getTags} from "~/models/tag.server";
import {getUserId, requireUserId} from "~/session.server";
import {useUser} from "~/utils";
import Layout from "../components/layout";

export async function loader({request, params}) {
  const userId = await requireUserId(request);
  const tags = await getTags({ userId })
  const url = new URL(request.url);
  const tagIds = url.searchParams.getAll("tag")
  const post = await getRandomPost({ userId, tagIds })
  return json({post, tags})
}

export default function Discover() {
  const data = useLoaderData();
  const user = useUser();
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagClick = (tag) => {
    if (selectedTags.indexOf(tag) != -1) return
    setSelectedTags([tag, ...selectedTags])
  }

  const handleTagUnclick = (tag) => {
    setSelectedTags(selectedTags.filter((selectedTag) => selectedTag != tag))
  }
 
  return (
    <Layout user={user}>
      <div
	key={data.post.id}
	className="mb-4 rounded border-l-2 border-blue-100 bg-blue-50 text-black hover:bg-blue-100"
      >
	<NavLink
	  className={({ isActive }) =>
	    `block border-b px-2 py-2 text-xl ${
	      isActive ? "bg-white" : ""
	    }`
	  }
	  to={`/posts/${data.post.id}`}
	>
	  <h2 className="text-md mb-1 font-bold">{data.post.title}</h2>
	  <p className="mr-2 mb-5 text-xs">{data.post.body}</p>
	  <TagList>
	    {data.post.tags.map((tag) => selectedTags.some((selectedTag) => selectedTag == tag.tag) ? (
	      <Tag className='bg-blue-50' key={tag.tag.id} id={tag.tag.slug}>
		{tag.tag.title}
	      </Tag>
	    ) : (
	      <Tag key={tag.tag.id} id={tag.tag.slug}>
		{tag.tag.title}
	      </Tag>
	    ))}
	  </TagList>
	</NavLink>
      </div>

      <Form method="get">
	<input type="hidden" name="q" value="random"/>
	{ selectedTags.map((tag) => (
	  <input type="hidden" name="tag" value={tag.id}/>
	))}
	<button type="submit" className="mb-4 w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400">Let me choose</button>
      </Form>

      <div className="grid grid-cols-2 gap-4">
	<div>
	  <p className="text-sm">Filter by tags</p>
	  <TagList>
	    {data.tags.map((tag) => selectedTags.some((selectedTag) => selectedTag == tag) ? (
	      <Tag className='bg-blue-100' key={tag.id} id={tag.slug} onClick={() => handleTagUnclick(tag)}>
		{tag.title}
	      </Tag>
	    ) : (
	      <Tag key={tag.id} id={tag.slug} onClick={() => handleTagClick(tag)}>
		{tag.title}
	      </Tag>
	    ))}
	  </TagList>
	</div>
	<div>
	  <p className="text-sm">Selected tags</p>
	  <TagList>
	    { selectedTags.map((tag) => (
	      <Tag className="md:text-4xl background-white" key={tag.id} id={tag.slug} onClick={() => handleTagUnclick(tag)}>
		{tag.title}
	      </Tag>
	    ))}
	  </TagList>
	</div>
      </div>
      <Outlet/>
    </Layout>
  );
}
