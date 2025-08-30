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
  const now = moment();
  const then = moment(date);

  const secondsDiff = now.diff(then, "seconds");

  if (secondsDiff <= 0) {
    return "Vừa gửi";
  }

  if (secondsDiff < 60) {
    return secondsDiff + " giây trước";
  } else if (secondsDiff < 3600) {
    const minutesDiff = now.diff(then, "minutes");
    return minutesDiff + " phút trước";
  } else if (secondsDiff < 86400) {
    const hoursDiff = now.diff(then, "hours");
    return hoursDiff + " giờ trước";
  } else {
    const daysDiff = now.diff(then, "days");
    return daysDiff + " ngày trước";
  }
};
