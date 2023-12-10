const getData = async () => {
  const res = await fetch("data3.csv");
  const resp = await res.text();
  const cdata = resp.split("\n").map((row, index) => {
    const [dateTime, open, high, low, close] = row.split(",");

    if (dateTime && open && high && low && close) {
      const [datePart, timePart] = dateTime.split(" ");
      const [year, month, day] = datePart.split("-");
      const [hour, minute, second] = timePart.split(":");

      const parsedTime = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
      );

      if (isNaN(parsedTime)) {
        console.error(`Invalid date format at line ${index + 1}: ${dateTime}`);
        return null;
      } else {
        console.log(dateTime, parsedTime);
        return {
          time: parsedTime / 1000,
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
        };
      }
    } else {
      console.error(`Invalid data format at line ${index + 1}: ${row}`);
      return null;
    }
  });

  return cdata.filter((row) => row !== null);
};

const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val.close, 0);
    sma.push(sum / period);
  }
  return sma;
};

const displayChart = async () => {
  const chartProperties = {
    width: window.innerWidth,
    height: window.innerHeight,
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
    layout: {
      background: { color: "#222" },
      textColor: "#DDD",
    },
    grid: {
      vertLines: { color: "#444" },
      horzLines: { color: "#444" },
    },
    localization: {
      timeFormatter: (businessDayOrTimestamp) => {
        if (typeof businessDayOrTimestamp === "number") {
          const date = new Date(businessDayOrTimestamp * 1000); // Convert seconds to milliseconds
          const formattedDate = `${date.getUTCFullYear()}-${(
            date.getUTCMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${date
            .getUTCDate()
            .toString()
            .padStart(2, "0")} ${date
            .getUTCHours()
            .toString()
            .padStart(2, "0")}:${date
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}:${date
            .getUTCSeconds()
            .toString()
            .padStart(2, "0")}`;
          return formattedDate;
        }
        return "";
      },
    },
  };

  const domElement = document.getElementById("tvchart");
  const chart = LightweightCharts.createChart(domElement, chartProperties);

  // Fetch and process data
  const klinedata = await getData();

  console.log("data", klinedata);

  // Add candlestick series
  const candleseries = chart.addCandlestickSeries();
  candleseries.setData(klinedata);

  chart.timeScale().fitContent();
  // Example of applying both properties in a single call
  chart.timeScale().applyOptions({
    borderColor: "#71649C",
    barSpacing: 10,
  });

  // Customizing the Crosshair
  chart.applyOptions({
    crosshair: {
      // Change mode from default 'magnet' to 'normal'.
      // Allows the crosshair to move freely without snapping to datapoints
      mode: LightweightCharts.CrosshairMode.Normal,

      // Vertical crosshair line (showing Date in Label)
      vertLine: {
        width: 8,
        color: "#C3BCDB44",
        style: LightweightCharts.LineStyle.Solid,
        labelBackgroundColor: "#9B7DFF",
      },

      // Horizontal crosshair line (showing Price in Label)
      horzLine: {
        color: "#9B7DFF",
        labelBackgroundColor: "#9B7DFF",
      },
    },
  });

  console.log(candleseries);

  // Calculate and add a 10-period SMA line
  // const sma10 = calculateSMA(klinedata, 44);
  // const lineSeries10 = chart.addLineSeries({ color: "blue", lineWidth: 2 });
  // lineSeries10.setData(
  //   sma10.map((value, index) => ({ time: klinedata[index + 9].time, value }))
  // );

  // // Calculate and add a 44-period high SMA line
  // const sma44High = calculateSMA(klinedata, 44);
  // const lineSeries44High = chart.addLineSeries({
  //   color: "green",
  //   lineWidth: 2,
  // });
  // lineSeries44High.setData(
  //   sma44High.map((value, index) => ({
  //     time: klinedata[index + 43].time,
  //     value,
  //   }))
  // );

  // // Calculate and add a 44-period low SMA line
  // const sma44Low = calculateSMA(klinedata, 44);
  // const lineSeries44Low = chart.addLineSeries({ color: "red", lineWidth: 2 });
  // lineSeries44Low.setData(
  //   sma44Low.map((value, index) => ({
  //     time: klinedata[index + 43].time,
  //     value,
  //   }))
  // );

  // let sma10Visible = true;
  // let sma44HighVisible = true;
  // let sma44LowVisible = true;

  // const toggleSMAVisibility = (smaType) => {
  //   switch (smaType) {
  //     case "sma10":
  //       sma10Visible = !sma10Visible;
  //       lineSeries10.applyOptions({ visible: sma10Visible });
  //       break;
  //     case "sma44High":
  //       sma44HighVisible = !sma44HighVisible;
  //       lineSeries44High.applyOptions({ visible: sma44HighVisible });
  //       break;
  //     case "sma44Low":
  //       sma44LowVisible = !sma44LowVisible;
  //       lineSeries44Low.applyOptions({ visible: sma44LowVisible });
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const addButton = (text, smaType) => {
  //   const button = document.createElement("button");
  //   button.innerText = text;
  //   button.onclick = () => toggleSMAVisibility(smaType);
  //   document.body.appendChild(button);
  // };

  // // Call the addButton function to create buttons for each SMA indicator
  // addButton("Toggle SMA10", "sma10");
  // addButton("Toggle SMA44 High", "sma44High");
  // addButton("Toggle SMA44 Low", "sma44Low");

  window.addEventListener("resize", () => {
    chart.resize(window.innerWidth, window.innerHeight);
  });
};

displayChart();
