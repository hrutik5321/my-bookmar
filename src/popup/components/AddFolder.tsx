import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { generateUniqueId } from "../utils";
import { Bookmark } from "@/models/bookmark";
import { useChromeStorage } from "@/Hooks/useChromeStorage";

const AddFolder = () => {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const { get, set } = useChromeStorage();

  const onSubmit = async () => {
    const results = await get("myKey");

    const finalPayload = [
      ...(results as Bookmark[]),
      {
        id: generateUniqueId(),
        name: title,
        childrens: [],
      },
    ];
    console.log("Prev Bookmarks Final: ", finalPayload);
    setTitle("");

    await set("myKey", finalPayload);
    navigate(-1);
  };

  useEffect(() => {
    get("myKey").then((result) => {
      console.log("Result: ", result);
    });
  }, []);
  return (
    <div className="min-w-[250px] p-3">
      <button
        className="cursor-pointer hover:scale-[1.1] transition-all  flex gap-1 items-center"
        onClick={() => navigate(-1)}
      >
        <IoIosArrowBack />
        Back
      </button>
      <h1 className="text-sm font-medium mt-3">Add Folder</h1>
      <div className="mt-2">
        <label htmlFor="title">Folder Name</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-2 h-[26px] w-full border border-gray-300 rounded-md focus-visible:border-blue-400 focus:outline-0"
        />
        <div className="mt-4">
          <button
            className="btn px-3 py-1 rounded-md bg-blue-500 text-white cursor-pointer"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFolder;
