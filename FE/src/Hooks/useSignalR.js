import { useEffect, useRef } from "react";
import signalrService from "../Services/signalrService";

export const useSignalREvent = (eventName, handler) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!eventName) return;

    signalrService.start();

    const callback = (...args) => {
      if (typeof handlerRef.current === "function") {
        handlerRef.current(...args);
      }
    };

    const unsubscribe = signalrService.on(eventName, callback);

    return () => {
      unsubscribe();
    };
  }, [eventName]);
};

export default signalrService;
