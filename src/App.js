import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {}, []);
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
    </div>
  );
}

export default App;
