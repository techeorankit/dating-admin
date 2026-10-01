"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";

export default function Analytics(props: any) {
  const {
    analyticsStartDate,
    analyticsStartEnd,
    analyticsStartDateSet,
    analyticsStartEndSet,
    direction,
  } = props;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    analyticsStartDate && analyticsStartDate !== "All"
      ? new Date(analyticsStartDate)
      : null,
    analyticsStartEnd && analyticsStartEnd !== "All"
      ? new Date(analyticsStartEnd)
      : null,
  ]);

  const [startDate, endDate] = dateRange;

  const handleChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);

    const [start, end] = update;

    analyticsStartDateSet(
      start ? moment(start).format("YYYY-MM-DD") : ""
    );

    analyticsStartEndSet(
      end ? moment(end).format("YYYY-MM-DD") : ""
    );
  };

  return (
    <div
      className="d-flex my-2 analytics-toolbar-root"
      style={{
        width: "300px",
        justifyContent: direction,
      }}
    >
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
        isClearable
        placeholderText="Select Date Range"
        dateFormat="yyyy-MM-dd"
        className={`daterange text-center`}
        customInput={<input type="text" className="daterange" style={{ width: "100%" }} />}
      />
    </div>
  );
}