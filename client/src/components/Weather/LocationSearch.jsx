import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

const LocationSearch = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onCurrentLocation,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSuggestionClick,
  suggestionRef,
}) => {
  const { t } = useTranslation();
  
  return (
    <motion.div className="mb-8 relative">
      <div className="flex w-fit items-center gap-4 border border-[#414142] p-4 rounded-lg bg-[#121215] shadow-lg">
        <div className="relative w-full" ref={suggestionRef}>
          <Input
            type="text"
            // value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder={t("weather.location.searchPlaceholder")}
            className="bg-gray-900 border-gray-700 text-white pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchQueryChange({ target: { value: "" } });
                setShowSuggestions(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => {
                let displayName = suggestion.display_name;
                const nameParts = suggestion.display_name.split(", ");

                if (nameParts.includes("India")) {
                  const city =
                    suggestion.address?.city ||
                    suggestion.address?.town ||
                    suggestion.address?.village ||
                    nameParts[0];

                  const region =
                    suggestion.address?.state ||
                    suggestion.address?.state_district ||
                    (nameParts.length > 2 ? nameParts[nameParts.length - 3] : "");

                  if (city && region) {
                    displayName = `${city}, ${region}, India`;
                  }
                }

                return (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => onSuggestionClick(suggestion)}>
                    <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="line-clamp-2">{displayName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Button
          onClick={onSearch}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Search className="h-4 w-4 mr-2" />
          {t("weather.location.search")}
        </Button>
        <Button
          onClick={onCurrentLocation}
          className="bg-green-600 hover:bg-green-700 cursor-pointer">
          <MapPin className="h-4 w-4 mr-2" />
          {t("weather.location.getPreciseLocation")}
        </Button>
      </div>
    </motion.div>
  );
};

export default LocationSearch;