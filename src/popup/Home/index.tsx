import { useEffect, useState } from "react";
import { FaFolder } from "react-icons/fa";
import { FaFolderOpen } from "react-icons/fa6";
import { generateUniqueId } from "../utils";
import { Link } from "react-router-dom";
import { Bookmark } from "@/models/bookmark";
import { useChromeStorage } from "@/Hooks/useChromeStorage";
import { key } from "../constants";

const Home = () => {
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [folderValue, setFolderValue] = useState<string>("");
  const [showAddFolder, setShowAddFolder] = useState<boolean>(false);
  const [bookMarks, setBookMarks] = useState<Bookmark[]>([]);
  const { get, set } = useChromeStorage();

  function getFaviconUrl(pageUrl: string, size: number = 32): string {
    const domain = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }

  const handlerMainKeyDown = (event: any) => {
    if (event.key === "Enter") {
      console.log("Bookmark");
      const prevFolders = bookMarks;
      prevFolders.push({
        id: generateUniqueId(),
        name: folderValue,
        childrens: [],
      });
      setBookMarks(prevFolders);
      setShowAddFolder(false);
      setFolderValue("");
      saveChromeStorage();
    }
  };

  const saveChromeStorage = () => {
    chrome.storage.local.set({ myKey: bookMarks }, () => {
      console.log("Bookmarks Saved");
    });
  };

  useEffect(() => {
    chrome.storage.local.get(["myKey"], (result) => {
      setBookMarks(result.myKey || []);
    });
  }, []);

  const deleteFolderHandler = (folderId: string) => {
    const prevFolders = bookMarks;
    prevFolders.splice(
      prevFolders.findIndex((folder) => folder.id === folderId),
      1
    );
    setBookMarks((prevFolder) =>
      prevFolder.filter((folder) => folder.id !== folderId)
    );
    saveChromeStorage();
  };

  const deleteLinkHandler = (folderId: string, linkId: string) => {
    const prevFolders = bookMarks;
    const folder = prevFolders.find((folder) => folder.id === folderId);
    if (folder) {
      folder.childrens = folder.childrens.filter((link) => link.id !== linkId);
    }

    if (folder) {
      setBookMarks((prev) => {
        return prev.map((prevFolder) => {
          if (prevFolder.id === folder?.id) {
            return folder;
          }
          return prevFolder;
        });
      });
    }

    saveChromeStorage();
  };

  const syncBookmarks = () => {
    const folders: Bookmark[] = [
      {
        id: generateUniqueId(),
        name: "Chrome",
        source: "chrome",
        childrens: [],
      },
    ];
    chrome.bookmarks.getTree((tree) => {
      if (tree.length) {
        const bookmarkList = tree![0].children![0].children;
        console.log("Tree: ", bookmarkList);
        bookmarkList!.map((bk) => {
          if (bk.children && bk.children.length) {
            const folder = {
              id: bk.id,
              name: bk.title,
              source: "chrome",
              childrens: bk.children.map((child) => {
                return {
                  link: child.url,
                  title: child.title,
                  id: child.id,
                };
              }),
            };

            folders.push(folder as Bookmark);
          } else {
            const defaultLink = folders.find(
              (folder) => folder.name === "Chrome"
            );
            if (defaultLink) {
              defaultLink.childrens.push({
                link: bk.url || "",
                title: bk.title,
                id: bk.id,
              });
            }

            const filteredFolders = folders.filter(
              (folder) => folder.name !== "Chrome"
            );
            filteredFolders.push(defaultLink as Bookmark);
          }
        });
      }
    });
    console.log("Final Bookmarks: ", folders);
    uploadChromeBookmarks(folders);
  };

  const uploadChromeBookmarks = async (chBookmarks: Bookmark[]) => {
    const defaultBookmarks = (await get(key)) as Bookmark[];
    const allFolderIds = defaultBookmarks.map((folder) => {
      return folder.id;
    });
    const bookmarksToUpload = chBookmarks.filter(
      (folder) => !allFolderIds.includes(folder.id)
    );

    await set(key, [
      ...bookmarksToUpload,
      ...defaultBookmarks.filter((ch) => ch.name !== "Chrome"),
    ]);

    setBookMarks([
      ...bookmarksToUpload,
      ...defaultBookmarks.filter((ch) => ch.name !== "Chrome"),
    ]);
  };

  const removeChromeBookmarks = async () => {
    const defaultBookmarks = (await get(key)) as Bookmark[];
    const allFilteredFolders = defaultBookmarks.filter(
      (folder) => folder.source !== "chrome"
    );
    console.log("Removed Bookmarks: ", allFilteredFolders);
    setBookMarks(allFilteredFolders);
    await set(key, allFilteredFolders);
  };

  return (
    <div className="p-3 min-w-[250px] border-none">
      <div>
        <button
          onClick={syncBookmarks}
          className="mb-3 bg-blue-400 text-white px-2 py-1 rounded-md cursor-pointer"
        >
          Sync Chrome Bookmarks
        </button>
        <button
          onClick={removeChromeBookmarks}
          className="mb-3 bg-red-400 text-white px-2 py-1 rounded-md cursor-pointer"
        >
          Remove Chrome Bookmarks
        </button>
      </div>
      <div className="flex justify-between mb-3">
        <p onClick={saveChromeStorage}>Bookmarks</p>
        <div>
          {showAddFolder ? (
            <>
              <input
                type="text"
                value={folderValue}
                onChange={(e) => setFolderValue(e.target.value)}
                onBlur={(e) => {
                  e.stopPropagation();
                  setShowAddFolder(false);
                  setFolderValue("");
                }}
                onKeyDown={handlerMainKeyDown}
                className="border border-gray-300 rounded-md px-1 w-[120px]"
                placeholder="Folder name"
              />
            </>
          ) : (
            <>
              <Link to="/add">
                <button
                  className="cursor-pointer"
                  onClick={() => setShowAddFolder(true)}
                >
                  Add Folder
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {bookMarks.map((bookmark) => {
          return (
            <div>
              <div className="flex justify-between gap-10">
                <div
                  className="flex gap-3 cursor-pointer"
                  onClick={(e) => {
                    setActiveFolder("");
                    setOpenFolders((prev) => {
                      if (prev.includes(bookmark.id)) {
                        return prev.filter((id) => id !== bookmark.id);
                      } else {
                        return [...prev, bookmark.id];
                      }
                    });
                    e.stopPropagation();
                  }}
                >
                  <div className="text-blue-400">
                    {openFolders.includes(bookmark.id) ? (
                      <FaFolderOpen size={18} />
                    ) : (
                      <FaFolder size={18} />
                    )}
                  </div>

                  <p>{bookmark.name}</p>
                </div>
                <div>
                  {activeFolder === bookmark.id ? (
                    <>
                      <input
                        type="text"
                        className="w-[100px] border px-1"
                        // onKeyDown={handleKeyDown}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={(e) => {
                          e.stopPropagation();
                          setActiveFolder("");
                          setInputValue("");
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <Link to={`/add/${bookmark.id}`}>
                        <button
                          //   onClick={() => setActiveFolder(bookmark.id)}
                          className="cursor-pointer"
                        >
                          + Add
                        </button>
                      </Link>
                      <button
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => deleteFolderHandler(bookmark.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {openFolders.includes(bookmark.id) ? (
                <>
                  {bookmark.childrens.length === 0 ? (
                    <>
                      <p className=" ml-7.5 text-[12px] text-gray-400">
                        No Data Found
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 ml-3 flex justify-center flex-col gap-2">
                        {bookmark.childrens.map((child) => {
                          return (
                            <div className="flex justify-between">
                              <a
                                href={child.link}
                                target="_blank"
                                className="flex gap-3"
                              >
                                <img
                                  src={getFaviconUrl(child.link, 14)}
                                  width={14}
                                  height={14}
                                  alt="favicon"
                                  className="w-3.5 h-3.5"
                                />
                                {/* <IoDocumentTextOutline size={14} /> */}
                                <p className="truncate">{child.title}</p>
                              </a>

                              <button
                                onClick={() =>
                                  deleteLinkHandler(bookmark.id, child.id)
                                }
                                className="cursor-pointer hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
