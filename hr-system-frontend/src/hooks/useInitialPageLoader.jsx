import { useEffect, useRef } from "react";

const useInitialPageLoader = (loading) => {
  const hasRenderedContentRef = useRef(false);

  useEffect(() => {
    if (!loading) {
      hasRenderedContentRef.current = true;
    }
  }, [loading]);

  return loading && !hasRenderedContentRef.current;
};

export default useInitialPageLoader;
