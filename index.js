const getData = async () => {
  const res = await fetch("data2.csv");
  const resp = await res.text();
  const cdata = resp.split("\n").map((row) => {
    const [dateStart, dateEnd, time, open, high, low, close] = row.split(",");

    if (dateStart && dateEnd && time && open && high && low && close) {
      let hour, minute;

      if (time.length === 3) {
        console.log(time);

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

      //console.log(dateTimeStr);

      return {
        time: dateTime.getTime(),
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
    width: 1500,
    height: 600,
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
  };

  const domElement = document.getElementById("tvchart");
  const chart = LightweightCharts.createChart(domElement, chartProperties);

  // Fetch and process data
  const klinedata = await getData();

  // Add candlestick series
  const candleseries = chart.addCandlestickSeries();
  candleseries.setData(klinedata);

  // Calculate and add a 10-period SMA line
  const sma10 = calculateSMA(klinedata, 44);
  const lineSeries10 = chart.addLineSeries({ color: "blue", lineWidth: 2 });
  lineSeries10.setData(
    sma10.map((value, index) => ({ time: klinedata[index + 9].time, value }))
  );

  // Calculate and add a 44-period high SMA line
  const sma44High = calculateSMA(klinedata, 44);
  const lineSeries44High = chart.addLineSeries({
    color: "green",
    lineWidth: 2,
  });
  lineSeries44High.setData(
    sma44High.map((value, index) => ({
      time: klinedata[index + 43].time,
      value,
    }))
  );

  // Calculate and add a 44-period low SMA line
  const sma44Low = calculateSMA(klinedata, 44);
  const lineSeries44Low = chart.addLineSeries({ color: "red", lineWidth: 2 });
  lineSeries44Low.setData(
    sma44Low.map((value, index) => ({
      time: klinedata[index + 43].time,
      value,
    }))
  );

  let sma10Visible = true;
  let sma44HighVisible = true;
  let sma44LowVisible = true;

  const toggleSMAVisibility = (smaType) => {
    switch (smaType) {
      case "sma10":
        sma10Visible = !sma10Visible;
        lineSeries10.applyOptions({ visible: sma10Visible });
        break;
      case "sma44High":
        sma44HighVisible = !sma44HighVisible;
        lineSeries44High.applyOptions({ visible: sma44HighVisible });
        break;
      case "sma44Low":
        sma44LowVisible = !sma44LowVisible;
        lineSeries44Low.applyOptions({ visible: sma44LowVisible });
        break;
      default:
        break;
    }
  };

  const addButton = (text, smaType) => {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = () => toggleSMAVisibility(smaType);
    document.body.appendChild(button);
  };

  // Call the addButton function to create buttons for each SMA indicator
  addButton("Toggle SMA10", "sma10");
  addButton("Toggle SMA44 High", "sma44High");
  addButton("Toggle SMA44 Low", "sma44Low");
};

displayChart();
