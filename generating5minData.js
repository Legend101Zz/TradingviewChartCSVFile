const fs = require("fs");

const inputFilePath = "data2.csv";
const outputFilePath = "data3.csv";

const getData = async () => {
  const resp = fs.readFileSync(inputFilePath, "utf-8");

  const cdata = resp.split("\n").map((row) => {
    const [dateStart, dateEnd, time, open, high, low, close] = row.split(",");

    if (dateStart && dateEnd && time && open && high && low && close) {
      let hour, minute;

      if (time.length === 3) {
        hour = parseInt(time[0]);
        minute = parseInt(time.slice(1));
      } else if (time.length === 4) {
        hour = parseInt(time.slice(0, 2));
        minute = parseInt(time.slice(2));
      } else {
        return null;
      }
      const dateTimeStr = `${dateStart.slice(0, 4)}-${dateStart.slice(
        4,
        6
      )}-${dateStart.slice(6)} ${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`;

      const dateTime = new Date(dateTimeStr);

      return {
        time: dateTimeStr,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
      };
    } else {
      return null;
    }
  });

  return cdata.filter((row) => row !== null);
};

const processData = (data) => {
  const newData = [];

  for (let i = 0; i < data.length; i += 4) {
    const chunk = data.slice(i, i + 4);

    if (chunk.length > 0) {
      const open = chunk[0].open;
      const close = chunk[chunk.length - 1].close;
      const high = Math.max(...chunk.map((item) => item.high));
      const low = Math.min(...chunk.map((item) => item.low));
      const time = chunk[0].time;

      newData.push({
        time,
        open,
        high,
        low,
        close,
      });
    }
  }

  return newData;
};

const readAndWriteData = async () => {
  try {
    const data = await getData();
    const newData = processData(data);

    // Writing the new CSV file
    const newCsvContent = newData
      .map(
        (item) =>
          `${item.time},${item.open},${item.high},${item.low},${item.close}`
      )
      .join("\n");

    fs.writeFileSync(outputFilePath, newCsvContent, "utf-8");

    console.log(
      `New CSV file with 5-minute OHLC data has been created: ${outputFilePath}`
    );
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
};

readAndWriteData();
