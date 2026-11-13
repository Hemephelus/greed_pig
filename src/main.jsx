import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import LiveGameSetup from "./routes/play_friends_live/setup/Setup";
import Home from "./routes/Home";
import SignIn from "./routes/SignIn";
import HowToPlay from "./routes/HowToPlay";
import LiveGame from "./routes/play_friends_live/game/Game";
import LiveGamePage from "./routes/play_friends_live/LivePage";
import EngineTest from "./routes/EngineTest";
import RoomPage from "./routes/room/RoomPage";
import History from "./routes/History";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

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
          {
            path: "how-to-play/",
            element: <HowToPlay />,
          },
        ],
      },
      {
        path: "sign-in/",
        element: <SignIn />,
      },
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "engine-test/",
        element: <EngineTest />,
      },
      {
        path: "history/",
        element: <History />,
      },
      {
        path: "room/:code",
        element: <RoomPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexAuthProvider>
  </React.StrictMode>
);