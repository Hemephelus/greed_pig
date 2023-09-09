import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Setup from "./routes/Setup"
import Home from "./routes/Home";
import HowToPlay from "./routes/HowToPlay";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "setup/",
        element: <Setup />,
      },
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "how-to-play/",
        element: <HowToPlay />,
      },
      // {
      //   path: "game/",
      //   element: < />,
      // },
      // {
      //   path: "game-over/",
      //   element: < />,
      // },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
