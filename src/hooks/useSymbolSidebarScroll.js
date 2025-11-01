import { useEffect, useRef } from "react";

export const useSymbolSidebarScroll = (listRef, selectedItemRef, selectedSymbol, loading) => {
  const isInitialMount = useRef(true);
  const lastSelectedSymbol = useRef(null);
  const isUserScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    const handleScroll = () => {
      isUserScrolling.current = true;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 150);
    };

    const listElement = listRef.current;
    listElement.addEventListener("scroll", handleScroll);

    return () => {
      listElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [listRef]);

  useEffect(() => {
    const shouldScroll = isInitialMount.current || lastSelectedSymbol.current !== selectedSymbol;
    
    if (shouldScroll && selectedItemRef.current && listRef.current && !isUserScrolling.current) {
      const itemElement = selectedItemRef.current;
      const listElement = listRef.current;
      
      const itemTop = itemElement.offsetTop;
      const itemBottom = itemTop + itemElement.offsetHeight;
      const listTop = listElement.scrollTop;
      const listBottom = listTop + listElement.clientHeight;

      if (itemTop < listTop) {
        listElement.scrollTo({
          top: itemTop - 16,
          behavior: isInitialMount.current ? "auto" : "smooth",
        });
      } else if (itemBottom > listBottom) {
        listElement.scrollTo({
          top: itemBottom - listElement.clientHeight + 16,
          behavior: isInitialMount.current ? "auto" : "smooth",
        });
      }
    }

    if (isInitialMount.current && !loading) {
      isInitialMount.current = false;
    }

    lastSelectedSymbol.current = selectedSymbol;
  }, [selectedSymbol, loading, listRef, selectedItemRef]);
};

