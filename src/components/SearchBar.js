import { Send } from "lucide-react";
import { useState } from "react";

function SearchBar({ onSubmit, isBottom, onInputChange, input }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <form
      className={`flex flex-col w-4/5 md:w-3/4 lg:w-3/5 xl:w-1/2 max-w-2xl ${
        isBottom
          ? "fixed bottom-24 lg:bottom-5 lg:ml-28 left-1/2 transform -translate-x-1/2 z-30"
          : "z-10"
      } `}
      onSubmit={onSubmit}
    >
      <div className="mb-2 sm:mb-4 relative">
        <input
          type="text"
          name="request"
          className={`h-12 sm:h-12 md:h-16 w-full p-2 sm:p-3 border ${
            isFocused
              ? "border-2 !border-primary-color dark:border-secondary-color placeholder-primary-color dark:placeholder-secondary-color"
              : "border-gray-400"
          } rounded-full text-sm sm:text-base dark:bg-dark-secondary-background dark:text-cross-color focus:outline-none`}
          placeholder="Search..."
          onChange={onInputChange}
          value={input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 flex items-center justify-center"
          title="search"
        >
          <Send
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isFocused
                ? "text-primary-color dark:text-secondary-color"
                : "text-gray-400"
            }`}
          />
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
