import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext, Context } from "./context/contextApi";
import ytLogo from "./images/yt-logo.png";
import ytLogoMobile from "./images/yt-logo-mobile.png";
import { SlMenu } from "react-icons/sl";
import { IoIosSearch } from "react-icons/io";
import { RiVideoAddLine } from "react-icons/ri";
import { FiBell } from "react-icons/fi";
import { CgClose } from "react-icons/cg";
import { categories } from "./utils/constants";
import { fetchDataFromApi } from "./utils/api";
import { abbreviateNumber } from "js-abbreviation-number";
import { BsFillCheckCircleFill } from "react-icons/bs";
import ReactPlayer from "react-player/youtube";
import { AiOutlineLike } from "react-icons/ai";
import moment from "moment";

function App() {
    return (
      <AppContext>
        <BrowserRouter>
          <div className="flex flex-col h-full">
            <Header/>
            <Routes>
              <Route exact path="/" element={<Feed />} />
              <Route path="/searchResult/:searchQuery" element={<SearchResult />} />
              <Route path="/video/:id" element={<VideoDetails />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AppContext>
    );
}

export default App;

// HEADER

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { loading, mobileMenu, setMobileMenu } = useContext(Context);
  const navigate = useNavigate();

  const searchQueryHandler = (event) => {
      // ? is called optional chaining. Like event? means if event is any invalid value then further checking of condition is not done, otherwise our app may crash

      if (
          (event?.key === "Enter" || event === "searchButton") &&
          searchQuery?.length > 0
      ) {
          navigate(`/searchResult/${searchQuery}`);
      }
  };

  const mobileMenuToggle = () => {
      setMobileMenu(!mobileMenu);
  };

  const { pathname } = useLocation();
  const pageName = pathname?.split("/")?.filter(Boolean)?.[0];

  return (
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between h-14 px-4 md:px-5 bg-white dark:bg-black">
          {loading && <Loader />}

          <div className="flex h-5 items-center">
              {pageName !== "video" && (
                  <div
                      className="flex md:hidden md:mr-6 cursor-pointer items-center justify-center h-10 w-10 rounded-full hover:bg-[#303030]/[0.6]"
                      onClick={mobileMenuToggle}
                  >
                      {mobileMenu ? (
                          <CgClose className="text-white text-xl" />
                      ) : (
                          <SlMenu className="text-white text-xl" />
                      )}
                  </div>
              )}
              <Link to="/" className="flex h-5 items-center">
                  <img
                      className="h-full hidden dark:md:block"
                      src={ytLogo}
                      alt="Youtube"
                  />
                  <img
                      className="h-full md:hidden"
                      src={ytLogoMobile}
                      alt="Youtube"
                  />
              </Link>
          </div>
          <div className="group flex items-center">
              <div className="flex h-8 md:h-10 md:ml-10 md:pl-5 border border-[#303030] rounded-l-3xl group-focus-within:border-blue-500 md:group-focus-within:ml-5 md:group-focus-within:pl-0">
                  <div className="w-10 items-center justify-center hidden group-focus-within:md:flex">
                      <IoIosSearch className="text-white text-xl" />
                  </div>
                  <input
                      type="text"
                      className="bg-transparent outline-none text-white pr-5 pl-5 md:pl-0 w-44 md:group-focus-within:pl-0 md:w-64 lg:w-[500px]"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyUp={searchQueryHandler}
                      placeholder="Search"
                      value={searchQuery}
                  />
              </div>
              <button
                  className="w-[40px] md:w-[60px] h-8 md:h-10 flex items-center justify-center border border-l-0 border-[#303030] rounded-r-3xl bg-white/[0.1]"
                  onClick={() => searchQueryHandler("searchButton")}
              >
                  <IoIosSearch className="text-white text-xl" />
              </button>
          </div>
          <div className="flex items-center">
              <div className="hidden md:flex">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-[#303030]/[0.6]">
                      <RiVideoAddLine className="text-white text-xl cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-center ml-2 h-10 w-10 rounded-full hover:bg-[#303030]/[0.6]">
                      <FiBell className="text-white text-xl cursor-pointer" />
                  </div>
              </div>
              <div className="flex h-8 w-8 overflow-hidden rounded-full md:ml-4">
                  <img src="https://xsgames.co/randomusers/assets/avatars/female/67.jpg" />
              </div>
          </div>
      </div>
  );
};


// FEED

const Feed = () => {
    const { loading, searchResults } = useContext(Context);

    useEffect(() => {
        document.getElementById("root").classList.remove("custom-h");
    }, []);

    return (
        <div className="flex flex-row h-[calc(100%-56px)]">
            <LeftNav />
            <div className="grow w-[calc(100%-240px)] h-full overflow-y-auto bg-black">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                    {!loading &&
                        searchResults.map((item) => {
                            if (item.type !== "video") return false;
                            return (
                                <VideoCard
                                    key={item?.video?.videoId}
                                    video={item?.video}
                                />
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

// LEFTNAV

const LeftNav = () => {
  const { selectedCategory, setSelectedCategory, mobileMenu } =
      useContext(Context);

  const navigate = useNavigate();

  const clickHandler = (name, type) => {
      switch (type) {
          case "category":
              return setSelectedCategory(name);
          case "home":
              return setSelectedCategory(name);
          case "menu":
              return false;
          default:
              break;
      }
  };

  return (
      <div
          className={`md:block w-[240px] overflow-y-auto h-full py-4 bg-black absolute md:relative z-10 translate-x-[-240px] md:translate-x-0 transition-all ${
              mobileMenu ? "translate-x-0" : ""
          }`}
      >
          <div className="flex px-5 flex-col">
              {categories.map((item) => {
                  return (
                      <React.Fragment key={item.name}>
                          <LeftNavMenuItem
                              text={item.type === "home" ? "Home" : item.name}
                              icon={item.icon}
                              action={() => {
                                  clickHandler(item.name, item.type);
                                  navigate("/");
                              }}
                              className={`${
                                  selectedCategory === item.name
                                      ? "bg-white/[0.15]"
                                      : ""
                              }`}
                          />
                          {item.divider && (
                              <hr className="my-5 border-white/[0.2]" />
                          )}
                      </React.Fragment>
                  );
              })}
              <hr className="my-5 border-white/[0.2]" />
              <div className="text-white/[0.5] text-[12px]">
                  You Tube clone
              </div>
          </div>
      </div>
  );
};

// LEFT NAV MENU ITEM

const LeftNavMenuItem = ({ text, icon, className, action }) => {
  return (
      <div
          className={
              "text-white text-sm cursor-pointer h-10 flex items-center px-3 mb-[1px] rounded-lg hover:bg-white/[0.15] " +
              className
          }
          onClick={action}
      >
          <span className="text-xl mr-5">{icon}</span>
          {text}
      </div>
  );
};

// SEARCH RESULT

const SearchResult = () => {
  const [result, setResult] = useState();
  const { searchQuery } = useParams();
  const { setLoading } = useContext(Context);

  useEffect(() => {
      document.getElementById("root").classList.remove("custom-h");
      fetchSearchResults();
  }, [searchQuery]);

  const fetchSearchResults = () => {
      setLoading(true);
      fetchDataFromApi(`search/?q=${searchQuery}`).then((res) => {
          console.log(res);
          setResult(res?.contents);
          setLoading(false);
      });
  };

  return (
      <div className="flex flex-row h-[calc(100%-56px)]">
          <LeftNav />
          <div className="grow w-[calc(100%-240px)] h-full overflow-y-auto bg-black">
              <div className="grid grid-cols-1 gap-2 p-5">
                  {result?.map((item) => {
                      if (item?.type !== "video") return false;
                      let video = item.video;
                      return (
                          <SearchResultVideoCard
                              key={video.videoId}
                              video={video}
                          />
                      );
                  })}
              </div>
          </div>
      </div>
  );
};

// SEARCH RESULT VIDEO CARD

const SearchResultVideoCard = ({ video }) => {
  return (
      <Link to={`/video/${video?.videoId}`}>
          <div className="flex flex-col md:flex-row mb-8 md:mb-3 lg:hover:bg-white/[0.1] rounded-xl md:p-4">
              <div className="relative flex shrink-0 h-48 md:h-28 lg:h-40 xl:h-48 w-full md:w-48 lg:w-64 xl:w-80 rounded-xl bg-slate-800 overflow-hidden">
                  <img
                      className="h-full w-full object-cover"
                      src={video?.thumbnails[0]?.url}
                  />
                  {video?.lengthSeconds && (
                      <VideoLength time={video?.lengthSeconds} />
                  )}
              </div>
              <div className="flex flex-col ml-4 md:ml-6 mt-4 md:mt-0 overflow-hidden">
                  <span className="text-lg md:text-2xl font-semibold line-clamp-2 text-white">
                      {video?.title}
                  </span>
                  <span className="empty:hidden text-sm line-clamp-1 md:line-clamp-2 text-white/[0.7] md:pr-24 md:my-4">
                      {video?.descriptionSnippet}
                  </span>
                  <div className="hidden md:flex items-center">
                      <div className="flex items-start mr-3">
                          <div className="flex h-9 w-9 rounded-full overflow-hidden">
                              <img
                                  className="h-full w-full object-cover"
                                  src={video?.author?.avatar[0]?.url}
                              />
                          </div>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-sm font-semibold mt-2 text-white/[0.7] flex items-center">
                              {video?.author?.title}
                              {video?.author?.badges[0]?.type ===
                                  "VERIFIED_CHANNEL" && (
                                  <BsFillCheckCircleFill className="text-white/[0.5] text-[12px] lg:text-[10px] xl:text-[12px] ml-1" />
                              )}
                          </span>
                          <div className="flex text-sm font-semibold text-white/[0.7] truncate overflow-hidden">
                              <span>{`${abbreviateNumber(
                                  video?.stats?.views,
                                  2
                              )} views`}</span>
                              <span className="flex text-[24px] leading-none font-bold text-white/[0.7] relative top-[-10px] mx-1">
                                  .
                              </span>
                              <span className="truncate">
                                  {video?.publishedTimeText}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </Link>
  );
};

// SUGGESTION VIDEO CARD

const SuggestionVideoCard = ({ video }) => {
  return (
      <Link to={`/video/${video?.videoId}`}>
          <div className="flex mb-3">
              <div className="relative h-24 lg:h-20 xl:h-24 w-40 min-w-[168px] lg:w-32 lg:min-w-[128px] xl:w-40 xl:min-w-[168px] rounded-xl bg-slate-800 overflow-hidden">
                  <img
                      className="h-full w-full object-cover"
                      src={video?.thumbnails[0]?.url}
                  />
                  {video?.lengthSeconds && (
                      <VideoLength time={video?.lengthSeconds} />
                  )}
              </div>
              <div className="flex flex-col ml-3 overflow-hidden">
                  <span className="text-sm lg:text-xs xl:text-sm font-bold line-clamp-2 text-white">
                      {video?.title}
                  </span>
                  <span className="text-[12px] lg:text-[10px] xl:text-[12px] font-semibold mt-2 text-white/[0.7] flex items-center">
                      {video?.author?.title}
                      {video?.author?.badges[0]?.type ===
                          "VERIFIED_CHANNEL" && (
                          <BsFillCheckCircleFill className="text-white/[0.5] text-[12px] lg:text-[10px] xl:text-[12px] ml-1" />
                      )}
                  </span>
                  <div className="flex text-[12px] lg:text-[10px] xl:text-[12px] font-semibold text-white/[0.7] truncate overflow-hidden">
                      <span>{`${abbreviateNumber(
                          video?.stats?.views,
                          2
                      )} views`}</span>
                      <span className="flex text-[24px] leading-none font-bold text-white/[0.7] relative top-[-10px] mx-1">
                          .
                      </span>
                      <span className="truncate">
                          {video?.publishedTimeText}
                      </span>
                  </div>
              </div>
          </div>
      </Link>
  );
};

// VIDEO CARD

const VideoCard = ({ video }) => {
  return (
      <Link to={`/video/${video?.videoId}`}>
          <div className="flex flex-col mb-8">
              <div className="relative h-48 md:h-40 md:rounded-xl overflow-hidden">
                  <img
                      className="h-full w-full object-cover"
                      src={video?.thumbnails[0]?.url}
                  />
                  {video?.lengthSeconds && (
                      <VideoLength time={video?.lengthSeconds} />
                  )}
              </div>
              <div className="flex text-white mt-3">
                  <div className="flex items-start">
                      <div className="flex h-9 w-9 rounded-full overflow-hidden">
                          <img
                              className="h-full w-full object-cover"
                              src={video?.author?.avatar[0]?.url}
                          />
                      </div>
                  </div>
                  <div className="flex flex-col ml-3 overflow-hidden">
                      <span className="text-sm font-bold line-clamp-2">
                          {video?.title}
                      </span>
                      <span className="text-[12px] font-semibold mt-2 text-white/[0.7] flex items-center">
                          {video?.author?.title}
                          {video?.author?.badges[0]?.type ===
                              "VERIFIED_CHANNEL" && (
                              <BsFillCheckCircleFill className="text-white/[0.5] text-[12px] ml-1" />
                          )}
                      </span>
                      <div className="flex text-[12px] font-semibold text-white/[0.7] truncate overflow-hidden">
                          <span>{`${abbreviateNumber(
                              video?.stats?.views,
                              2
                          )} views`}</span>
                          <span className="flex text-[24px] leading-none font-bold text-white/[0.7] relative top-[-10px] mx-1">
                              .
                          </span>
                          <span className="truncate">
                              {video?.publishedTimeText}
                          </span>
                      </div>
                  </div>
              </div>
          </div>
      </Link>
  );
};

// VIDEO DETAILS

const VideoDetails = () => {
  const [video, setVideo] = useState();
  const [relatedVideos, setRelatedVideos] = useState();
  const { id } = useParams();
  const { setLoading } = useContext(Context);

  useEffect(() => {
      document.getElementById("root").classList.add("custom-h");
      fetchVideoDetails();
      fetchRelatedVideos();
  }, [id]);

  const fetchVideoDetails = () => {
      setLoading(true);
      fetchDataFromApi(`video/details/?id=${id}`).then((res) => {
          console.log(res);
          setVideo(res);
          setLoading(false);
      });
  };

  const fetchRelatedVideos = () => {
      setLoading(true);
      fetchDataFromApi(`video/related-contents/?id=${id}`).then((res) => {
          console.log(res);
          setRelatedVideos(res);
          setLoading(false);
      });
  };

  return (
      <div className="flex justify-center flex-row h-[calc(100%-56px)] bg-black">
          <div className="w-full max-w-[1280px] flex flex-col lg:flex-row">
              <div className="flex flex-col lg:w-[calc(100%-350px)] xl:w-[calc(100%-400px)] px-4 py-3 lg:py-6 overflow-y-auto">
                  <div className="h-[200px] md:h-[400px] lg:h-[400px] xl:h-[550px] ml-[-16px] lg:ml-0 mr-[-16px] lg:mr-0">
                      <ReactPlayer
                          url={`https://www.youtube.com/watch?v=${id}`}
                          controls
                          width="100%"
                          height="100%"
                          style={{ backgroundColor: "#000000" }}
                          playing={true}
                      />
                  </div>
                  <div className="text-white font-bold text-sm md:text-xl mt-4 line-clamp-2">
                      {video?.title}
                  </div>
                  <div className="flex justify-between flex-col md:flex-row mt-4">
                      <div className="flex">
                          <div className="flex items-start">
                              <div className="flex h-11 w-11 rounded-full overflow-hidden">
                                  <img
                                      className="h-full w-full object-cover"
                                      src={video?.author?.avatar[0]?.url}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-col ml-3">
                              <div className="text-white text-md font-semibold flex items-center">
                                  {video?.author?.title}
                                  {video?.author?.badges[0]?.type ===
                                      "VERIFIED_CHANNEL" && (
                                      <BsFillCheckCircleFill className="text-white/[0.5] text-[12px] ml-1" />
                                  )}
                              </div>
                              <div className="text-white/[0.7] text-sm">
                                  {video?.author?.stats?.subscribersText}
                              </div>
                          </div>
                      </div>
                      <div className="flex text-white mt-4 md:mt-0">
                          <div className="flex items-center justify-center h-11 px-6 rounded-3xl bg-white/[0.15]">
                              <AiOutlineLike className="text-xl text-white mr-2" />
                              {`${abbreviateNumber(
                                  video?.stats?.views,
                                  2
                              )} Likes`}
                          </div>
                          <div className="flex items-center justify-center h-11 px-6 rounded-3xl bg-white/[0.15] ml-4">
                              {`${abbreviateNumber(
                                  video?.stats?.views,
                                  2
                              )} Views`}
                          </div>
                      </div>
                  </div>
              </div>
              <div className="flex flex-col py-6 px-4 overflow-y-auto lg:w-[350px] xl:w-[400px]">
                  {relatedVideos?.contents?.map((item, index) => {
                      if (item?.type !== "video") return false;
                      return (
                          <SuggestionVideoCard
                              key={index}
                              video={item?.video}
                          />
                      );
                  })}
              </div>
          </div>
      </div>
  );
};

// LOADER

const Loader = () => {
  return (
      <div className="load-bar">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
      </div>
  );
};

// VIDEO LENGTH

const VideoLength = ({ time }) => {
  const videoLengthInSeconds = moment()
      ?.startOf("day")
      ?.seconds(time)
      ?.format("H:mm:ss");
  return (
      <span className="absolute bottom-2 right-2 bg-black py-1 px-2 text-white text-xs rounded-md">
          {videoLengthInSeconds}
      </span>
  );
};