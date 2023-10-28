import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import LiveGameSetup from "./routes/play_friends_live/setup/Setup";
import Home from "./routes/Home";
import HowToPlay from "./routes/HowToPlay";
import LiveGame from "./routes/play_friends_live/game/Game";
import LiveGamePage from "./routes/play_friends_live/LivePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "live-game/",
        element: <LiveGamePage />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "setup/",
            element: <LiveGameSetup />,
          },
          {
            path: "game/",
            element: <LiveGame />,
          },
          // {
          //   path: "game-over/",
          //   element: < />,
          // },
        ]},
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "how-to-play/",
        element: <HowToPlay />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
