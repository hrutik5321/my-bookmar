import { useChromeStorage } from "@/Hooks/useChromeStorage";
import { Bookmark } from "@/models/bookmark";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { generateUniqueId } from "../utils";

const AddLink = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookmark, setBookmark] = useState<Bookmark>();
  const { get, set } = useChromeStorage();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const getSelectedBookMark = async () => {
    const result = (await get("myKey")) as Bookmark[];
    const selectedBookmark = result.find(
      (bookmark: Bookmark) => bookmark.id === id
    );
    setBookmark(selectedBookmark);
  };

  useEffect(() => {
    getSelectedBookMark();
  }, [id]);

  const onSubmit = async () => {
    const results = (await get("myKey")) as Bookmark[];

    const finalPayload = results.map((bk) => {
      if (bk.id === bookmark?.id) {
        return {
          ...bk,
          childrens: [
            ...bk.childrens,
            {
              link: link,
              title: title,
              id: generateUniqueId(),
            },
          ],
        };
      } else {
        return bk;
      }
    });

    await set("myKey", finalPayload);
    navigate(-1);
  };

  return (
    <div className="min-w-[250px] p-3">
      <button
        className="cursor-pointer hover:scale-[1.1] transition-all  flex gap-1 items-center"
        onClick={() => navigate(-1)}
      >
        <IoIosArrowBack />
        Back
      </button>
      <h1 className="text-xs font-medium mt-3">
        Add Link To{" "}
        <span className="truncate text-blue-500">{bookmark?.name}</span>
      </h1>
      <div className="mt-3">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-2 h-[26px] w-full border border-gray-300 rounded-md focus-visible:border-blue-400 focus:outline-0"
        />
      </div>
      <div className="mt-3">
        <label htmlFor="link">Link</label>
        <input
          id="link"
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="px-2 h-[26px] w-full border border-gray-300 rounded-md focus-visible:border-blue-400 focus:outline-0"
        />
      </div>
      <div>
        <button
          onClick={onSubmit}
          className="btn px-3 py-1 rounded-md bg-blue-400 text-white mt-3"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddLink;
