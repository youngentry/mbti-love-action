import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [comments, setComments] = useState([]);

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
      } while (nextPageToken && comments.length < 50);

      return comments;
    } catch (error) {
      console.error(error, "getPlaylistItems error");
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      setComments(await getAllComments("jqvCCJ25LiY"));
    })();
  }, []);
  return (
    <div className="App">
      <iframe
        width="871"
        height="490"
        src="https://www.youtube.com/embed/jqvCCJ25LiY"
        title="MBTI별 짝사랑 상대에게 하는 행동"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>

      {comments.length &&
        comments.map((comment) => {
          const { textDisplay, likeCount, updatedAt, authorDisplayName } = comment.snippet.topLevelComment.snippet;
          return (
            <div>
              <div>{authorDisplayName}</div>
              <p>{textDisplay}</p>
              <div>
                <span>{likeCount}</span>
                <span>{updatedAt}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default App;
