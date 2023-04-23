import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import he from "he";

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
      } while (nextPageToken && comments.length < 200);

      return comments;
    } catch (error) {
      console.error(error, "getPlaylistItems error");
      return [];
    }
  };

  const mbitArray = ["ENFJ", "ENTJ", "ENFP", "ENTP", "ESFP", "ESFJ", "ESTP", "ESTJ", "INFP", "INFJ", "INTP", "ISTP", "ISFP", "ISFJ", "ISTJ", "INTJ"];

  useEffect(() => {
    (async () => {
      const commentsBeforeRefine = await getAllComments("jqvCCJ25LiY");
      const refinedComments = commentsBeforeRefine.map((comment) => {
        let { textDisplay, likeCount, updatedAt, authorDisplayName } = comment.snippet.topLevelComment.snippet;
        textDisplay = he.decode(textDisplay).replaceAll("<br>", "\n");

        const [firstLine, message] = textDisplay.split("\n");

        for (let i = 0; i < mbitArray.length; i++) {
          if (firstLine.includes(mbitArray[i].toUpperCase())) {
            return { textDisplay, likeCount, updatedAt, authorDisplayName, mbti: mbitArray[i] };
          }
        }
        return false;
      });
      const filteredComments = refinedComments.filter((comment) => comment !== false);
      setComments(filteredComments);
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
          console.log(comment);
          const { textDisplay, likeCount, updatedAt, authorDisplayName } = comment;
          return (
            <div>
              <div>{authorDisplayName}</div>
              <p>
                <pre>{textDisplay}</pre>
              </p>
              <div>
                <span>Like:{likeCount}</span>
                <span>Date:{updatedAt}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default App;
