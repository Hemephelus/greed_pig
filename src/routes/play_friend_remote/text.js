import { createContext, useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [unviewedMessageCount, setUnviewedMessageCount] = useState(0);
  const [isOnBottom, setIsOnBottom] = useState(false);
  const scrollRef = useRef(null);
  const latestMessageId = useRef(null);
  const { results: messages, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    {},
    { initialNumItems: 50 }
  );

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const currentUsername =
      storedUsername || `@user${Date.now().toString().slice(-4)}`;
    setUsername(currentUsername);
    localStorage.setItem("username", currentUsername);

    const storedCountryCode = localStorage.getItem("countryCode");
    if (storedCountryCode && storedCountryCode !== "undefined") {
      setCountryCode(storedCountryCode);
      return;
    }

    fetch("https://api.db-ip.com/v2/free/self")
      .then((response) => response.json())
      .then(({ countryCode: detectedCountryCode }) => {
        if (!detectedCountryCode) return;
        setCountryCode(detectedCountryCode);
        localStorage.setItem("countryCode", detectedCountryCode);
      })
      .catch((error) => console.error("Could not detect country:", error));
  }, []);

  useEffect(() => {
    if (status === "LoadingFirstPage" || !messages?.length) return;

    const latestMessage = messages[0];
    if (latestMessageId.current === null) {
      latestMessageId.current = latestMessage._id;
      return;
    }

    if (latestMessageId.current !== latestMessage._id) {
      latestMessageId.current = latestMessage._id;
      if (latestMessage.username === username) scrollToBottom();
      else setUnviewedMessageCount((count) => count + 1);
    }
  }, [messages, status, username]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const onScroll = ({ target }) => {
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 1) {
      setUnviewedMessageCount(0);
      setIsOnBottom(true);
    } else {
      setIsOnBottom(false);
    }

    if (target.scrollTop === 0 && status === "CanLoadMore") {
      loadMore(50);
      target.scrollTop = 1;
    }
  };

  return (
    <AppContext.Provider
      value={{
        messages: messages ?? [],
        loadingInitial: status === "LoadingFirstPage",
        error: "",
        username,
        setUsername,
        randomUsername: () => `@user${Date.now().toString().slice(-4)}`,
        routeHash: "",
        scrollRef,
        onScroll,
        scrollToBottom,
        isOnBottom,
        country: countryCode,
        unviewedMessageCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return context;
};

export { AppContext as default, AppContextProvider, useAppContext };
