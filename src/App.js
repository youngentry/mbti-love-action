import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import he from "he";

export const getRelativeTime = (publishedAt) => {
  const time = new Date(publishedAt);
  const now = Date.now();
  const difference = now - time.getTime();

  if (difference < 1000 * 60 * 60) return `${Math.floor(difference / (1000 * 60))} Minute ago`;
  if (difference < 1000 * 60 * 60 * 24) return `${Math.floor(difference / (1000 * 60 * 60))} Hour ago`;
  if (difference < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(difference / (1000 * 60 * 60 * 24))} Day ago`;
  if (difference < 1000 * 60 * 60 * 24 * 30) return `${Math.floor(difference / (1000 * 60 * 60 * 24 * 7))} Week ago`;
  if (difference < 1000 * 60 * 60 * 24 * 365) return `${Math.floor(difference / (1000 * 60 * 60 * 24 * 30))} Month ago`;
  return `${Math.floor(difference / (1000 * 60 * 60 * 24 * 30 * 365)) + 1} Year ago`;
};

/**
 * @param {Array} channelIdArray
 * @returns
 */
const getAllComments = async (videoId) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  let nextPageToken = null;

  let comments = [];

  try {
    do {
      const params = {
        key: apiKey,
        part: "snippet",
        videoId,
        order: "relevance",
        maxResults: 100,
        pageToken: nextPageToken,
      };
      const response = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", { params });
      comments = [...comments, ...response.data.items];
      nextPageToken = response.data.nextPageToken || null;
    } while (nextPageToken && comments.length < 1600);
    return comments;
  } catch (error) {
    console.error(error, "getPlaylistItems error");
    return [];
  }
};

const mbitArray = ["ALL", "ISTP", "ISFP", "INFP", "INTP", "ISTJ", "ISFJ", "INFJ", "INTJ", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"];

const videoList = [
  { id: "jqvCCJ25LiY", title: "MBTI별 짝사랑 상대에게 하는 행동" },
  { id: "EHXQTGC3pH0", title: "MBTI별 이렇게 하면 반드시 넘어온다." },
  { id: "9Vph7WlC8MQ", title: "𝗠𝗯𝘁𝗶별 연애스타일" },
];

function App() {
  const [isTopTransparent, setIsTopTransparent] = useState(false);
  const [videoId, setVideoId] = useState("jqvCCJ25LiY");
  const [searchInput, setSearchInput] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedId, setSelectedId] = useState([]);
  const [selectedMbti, setSelectedMbti] = useState(["ISTP", "ESTP"]);
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [copyIndex, setCopyIndex] = useState(null);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log(searchInput.slice(0, 17));
    if (searchInput.slice(0, 32) === "https://www.youtube.com/watch?v=") {
      return setVideoId(searchInput.slice(32, 43));
    }
    if (searchInput.slice(0, 17) === "https://youtu.be/") {
      return setVideoId(searchInput.slice(17, 28));
    }
  };

  const handleShowAll = (index) => {
    setSelectedId([...selectedId, index]);
  };

  const handleProperty = (mbti) => {
    if (mbti === "ALL" && selectedMbti.length !== 17) {
      return setSelectedMbti(mbitArray);
    }

    if (mbti === "ALL" && selectedMbti.length === 17) {
      return setSelectedMbti(["ISTP"]);
    }

    if (selectedMbti.includes(mbti)) {
      const filteredSelectedMbti = selectedMbti.filter((includedMbti) => includedMbti !== mbti);
      return setSelectedMbti(filteredSelectedMbti);
    }

    setSelectedMbti([...selectedMbti, mbti]);
  };

  const findVideoComments = async (videoId) => {
    const commentsBeforeRefine = await getAllComments(videoId);
    const refinedComments = commentsBeforeRefine.map((comment) => {
      let { textDisplay, likeCount, updatedAt, authorDisplayName } = comment.snippet.topLevelComment.snippet;
      textDisplay = he.decode(textDisplay).replaceAll("<br>", "\n");
      updatedAt = getRelativeTime(updatedAt);
      const [firstLine, message] = textDisplay.split("\n");
      for (let i = 0; i < mbitArray.length; i++) {
        if (firstLine.includes(mbitArray[i].toUpperCase())) {
          return { textDisplay, likeCount, updatedAt, authorDisplayName, mbti: mbitArray[i], isShow: false };
        }
      }
      return false;
    });
    const filteredComments = refinedComments.filter((comment) => comment !== false);
    setComments(filteredComments);
  };

  const handleCopyClick = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => setIsCopySuccess(true))
      .catch(() => setIsCopySuccess(false));
    setCopyIndex(index);
  };

  useEffect(() => {
    (async () => {
      findVideoComments(videoId);
    })();
  }, [videoId]);

  useEffect(() => {}, [comments, selectedMbti]);

  useEffect(() => {
    let timeoutId;
    if (isCopySuccess) {
      timeoutId = setTimeout(() => setIsCopySuccess(false), 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [isCopySuccess]);
  console.log("https://www.youtube.com/watch?v=".length);

  return (
    <div className="App">
      <div className={`top`}>
        <iframe
          className={`video ${isTopTransparent && "transparent"}`}
          width="100%"
          height="120"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="MBTI별 짝사랑 상대에게 하는 행동"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
        {isSearchVisible ? (
          <div className={`search ${isTopTransparent && "transparent"}`}>
            <div className="searchOpen" onClick={() => setIsSearchVisible(false)}>
              Fold Search Menu
            </div>
            <form className="searchForm" action="" onSubmit={handleSearchSubmit}>
              <input className="searchInput" type="text" onChange={handleInputChange} value={searchInput} placeholder="유튜브 동영상 주소 URL" required />
              <button className="searchButton">Search</button>
            </form>
            <ul>
              {videoList.map((video) => {
                return (
                  <li className={`videoList ${video.id === videoId && "display"}`} onClick={() => setVideoId(video.id)}>
                    {video.title}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className={`searchOpen ${isTopTransparent && "transparent"}`} onClick={() => setIsSearchVisible(true)}>
            Search Video🔎
          </div>
        )}
        <div className="property">
          {mbitArray.map((mbti) => {
            return (
              <span className={`mbti ${selectedMbti.includes(mbti) && "selected"}`} onClick={() => handleProperty(mbti)}>
                {mbti}
              </span>
            );
          })}
        </div>
        {isTopTransparent ? (
          <div className="transparentButton" onClick={() => setIsTopTransparent(!isTopTransparent)}>
            Open menu
          </div>
        ) : (
          <div className="transparentButton" onClick={() => setIsTopTransparent(!isTopTransparent)}>
            <span className="hideMenu">Hide menu</span> <span className="made"> (made by gentry_@naver.com)</span>
          </div>
        )}
      </div>

      {selectedMbti.length ? (
        comments.map((comment, index) => {
          let { textDisplay, likeCount, updatedAt, authorDisplayName, mbti } = comment;
          updatedAt = updatedAt;
          return selectedMbti.includes(mbti) || selectedMbti.includes("ALL") ? (
            <div className="comment">
              <div className="user">
                <span className="userName"> {authorDisplayName}</span>
                <span className="updatedAt">{updatedAt}</span>
                <span className="copy" onClick={() => handleCopyClick(textDisplay, index)}>
                  COPY
                </span>
                {isCopySuccess && copyIndex === index && <span className="copySuccess">댓글이 복사되었습니다.</span>}
              </div>
              {selectedId.includes(index) ? (
                <p className="text">
                  <pre>{textDisplay}</pre>
                </p>
              ) : (
                <p className="text">
                  <pre className="shortText">{textDisplay}</pre>
                  <span className="showAllText" onClick={() => handleShowAll(index)}>
                    Show more
                  </span>
                </p>
              )}
              <div>
                <p className="likeHit">
                  Like: <span className="likeCount">{likeCount}</span>
                </p>
              </div>
            </div>
          ) : null;
        })
      ) : (
        <div>MBTI를 선택해 주세요😍</div>
      )}
    </div>
  );
}

export default App;
