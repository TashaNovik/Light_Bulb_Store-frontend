import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchActive: boolean;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const isSearchActive = searchQuery.trim().length > 0;

  const clearSearch = () => {
    setSearchQuery("");
  };

  const contextValue: SearchContextType = {
    searchQuery,
    setSearchQuery,
    isSearchActive,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
