"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import moment from "moment";

export const convertToDate = (dob: any) => {
  const formattedDate = moment(dob).format("DD/MM/YYYY");
  return formattedDate;
};

export const convertToDateTime = (date: any) => {
  const formattedDate = moment(date).format("YYYY-MM-DD");
  return formattedDate;
};

export const convertDateToDateObj = (date: any) => {
  const dateObj = new Date(date);
  return dateObj;
};

export const convertToTime = (date: any) => {
  const { t } = useLanguage();
  const now = moment();
  const then = moment(date);

  const secondsDiff = now.diff(then, "seconds");

  if (secondsDiff <= 0) {
    return ` ${t("dashboard.justNow")}`;
  }

  if (secondsDiff < 60) {
    return secondsDiff + ` ${t("dashboard.secondsAgo")}`;
  } else if (secondsDiff < 3600) {
    const minutesDiff = now.diff(then, "minutes");
    return minutesDiff + ` ${t("dashboard.minutesAgo")}`;
  } else if (secondsDiff < 86400) {
    const hoursDiff = now.diff(then, "hours");
    return hoursDiff + ` ${t("dashboard.hoursAgo")}`;
  } else {
    const daysDiff = now.diff(then, "days");
    return daysDiff + ` ${t("dashboard.daysAgo")}`;
  }
};

export const formatTime = (timestamp: any | number | Date) => {
  const date = timestamp && new Date(timestamp);
  return date
    ? `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    : "";
};
