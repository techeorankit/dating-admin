import React, { useEffect, useMemo, useState } from "react";
import ReactSelect from "react-select";
import countriesData from "@/api/countries.json";

const CountryOption = ({ innerRef, innerProps, data }: any) => (
  <div
    ref={innerRef}
    {...innerProps}
    className="optionShow-option p-2 d-flex align-items-center"
  >
    {data.flagUrl && (
      <img
        height={20}
        width={28}
        alt={data.name}
        src={data.flagUrl}
        className="me-2"
        style={{ objectFit: "cover" }}
        onError={(e: any) => {
          e.target.style.display = "none";
        }}
      />
    )}
    <span>{data.label}</span>
  </div>
);

export default function Searching(props: any) {
  const [search, setSearch] = useState("");

  const {
    data,
    setData,
    type,
    serverSearching,
    button,
    placeholder,
    // optional dropdown props to make search + filter reusable
    filterOptions,
    filterValue,
    onFilterChange,
    // optional country filter props for user list
    countryValue,
    onCountryChange,
  } = props;

  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [countrySearchInput, setCountrySearchInput] = useState("");

  useEffect(() => {
    try {
      // Transform countries to React Select format, reusing AgencyDialog logic
      const transformedCountries = countriesData
        .filter(
          (country: any) =>
            country.name?.common && country.cca2 && country.flags?.png
        )
        .map((country: any) => ({
          value: country.name.common,
          label: country.name.common,
          name: country.name.common,
          code: country.cca2,
          flagUrl: country.flags.png || country.flags.svg,
          flag: country.flags.png || country.flags.svg,
        }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label));

      const allOption = {
        value: "",
        label: "All Countries",
        name: "All Countries",
        code: "ALL",
        flagUrl: "",
        flag: "",
      };

      setCountryOptions([allOption, ...transformedCountries]);
    } catch (error) {
      console.error("Failed to process countries for Searching filter:", error);
    }
  }, []);

  const selectedCountryOption = useMemo(() => {
    if (!countryOptions.length) return null;
    if (!countryValue) return countryOptions[0]; // "All Countries"
    return (
      countryOptions.find((opt) => opt.value === countryValue) ||
      countryOptions[0]
    );
  }, [countryOptions, countryValue]);

  const displayedCountryOptions = useMemo(() => {
    if (!countryOptions.length) return [];

    let list: any[] = [];

    // When there is no input, show only "All Countries" + first 5
    if (!countrySearchInput.trim()) {
      const [allOption, ...rest] = countryOptions;
      list = [allOption, ...rest.slice(0, 5)];
    } else {
      const input = countrySearchInput.toLowerCase();
      list = countryOptions.filter((opt) =>
        opt.label.toLowerCase().includes(input)
      );
    }

    return list;
  }, [countryOptions, countrySearchInput]);

  const handleSearch = (event: any) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    const searchValue =
      typeof event === "string"
        ? event.toLowerCase()
        : search
          ? search
          : event?.target?.value?.toLowerCase();

    if (type === "client") {
      if (searchValue) {
        const filteredData = data.filter((item: any) => {
          return Object.keys(item).some((key) => {
            if (key === "_id" || key === "updatedAt" || key === "createdAt") {
              return false;
            }
            const itemValue = item[key];
            if (typeof itemValue === "string") {
              return itemValue.toLowerCase().includes(searchValue);
            } else if (typeof itemValue === "number") {
              return itemValue.toString().includes(searchValue);
            }
            return false;
          });
        });
        setData(filteredData);
      } else {
        setData(data);
      }
    } else {
      serverSearching(searchValue);
    }
  };

  const handleCountrySelectChange = (selected: any | null) => {
    if (!onCountryChange) return;

    const value = selected?.value ?? "";
    onCountryChange(value);
  };

  const countryMenuPortalTarget =
    typeof window !== "undefined" ? document.body : null;

  return (
    <div className="searching-toolbar d-flex align-items-stretch align-items-md-center gap-2 w-100 flex-column flex-md-row">
      {onCountryChange && (
        <div className="searching-toolbar__field searching-toolbar__field--country" style={{ minWidth: "170px", maxWidth: "220px" }}>
          <ReactSelect
            options={displayedCountryOptions}
            value={selectedCountryOption}
            isClearable={false}
            placeholder="All Countries"
            onChange={handleCountrySelectChange}
            onInputChange={(value) => {
              setCountrySearchInput(value);
            }}
            classNamePrefix="react-select"
            className="mt-0"
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menu: (base) => ({
                ...base,
                right: 0,
                left: "auto",
              }),
              container: (provided) => ({
                ...provided,
                fontSize: "14px",
              }),
              control: (provided) => ({
                ...provided,
                minHeight: "38px",
              }),
              valueContainer: (provided) => ({
                ...provided,
                paddingLeft: 8,
              }),
            }}
            menuPortalTarget={countryMenuPortalTarget}
            menuPosition="fixed"
            formatOptionLabel={(option: any) => (
              <div className="d-flex align-items-center">
                {option.flagUrl && (
                  <img
                    height={18}
                    width={26}
                    alt={option.name}
                    src={option.flagUrl}
                    className="me-2"
                    style={{ objectFit: "cover" }}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <span>{option.label}</span>
              </div>
            )}
            components={{
              Option: CountryOption,
            }}
            // Disable built-in filtering so we control first-5 logic
            filterOption={() => true}
          />
        </div>
      )}

      {filterOptions && onFilterChange && (
        <select
          className="form-select searching-toolbar__field searching-toolbar__field--filter"
          style={{ minWidth: "140px", maxWidth: "180px" }}
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      <div className="inputData d-flex flex-grow-1 searching-toolbar__field searching-toolbar__field--search w-100">
        <input
          type="search"
          id="search"
          placeholder={placeholder}
          className="bg-none m0-top flex-grow-1"
          style={{
            fontWeight: "400",
            color: "#000",
            padding: "0 20px",
            backgroundColor: "#fff",
          }}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value); // rohit add
            if (value.length === 0) {
              button ? setSearch("") : handleSearch("");
            }
          }}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              button ? setSearch(e.target.value) : handleSearch(e);
            }
          }}
        />
        <div
          className="bg-theme p15-x midBox searchIcon"
          onClick={() => handleSearch(search)} // rohit add
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5 9C20.6421 9 24 12.3579 24 16.5M24.9882 24.9823L31.5 31.5M28.5 16.5C28.5 23.1275 23.1275 28.5 16.5 28.5C9.87258 28.5 4.5 23.1275 4.5 16.5C4.5 9.87258 9.87258 4.5 16.5 4.5C23.1275 4.5 28.5 9.87258 28.5 16.5Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
