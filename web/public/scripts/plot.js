// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime)
{
  return new Date(epochTime*1000);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime)
{
  var epochDate = new Date(epochToJsDate(epochTime));
  var SensordateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);
  return SensordateTime;
}

// function to plot values on charts
function plotValues(chart, timestamp, value)
{
  var x = epochToJsDate(timestamp).getTime();
  var y = Number (value);
  if(chart.series[0].data.length >= chartRange) 
  {
    chart.series[0].addPoint([x, y], true, true, true);
  } else {
    chart.series[0].addPoint([x, y], true, false, true);
  }
}

// Database path for Sensor
var dbPathSensor = '/board1/Sensor';
var chartPath = '/board1/charts/range';
// Database references for Sensor
var dbRefSensor = firebase.database().ref().child(dbPathSensor);
var chartRef = firebase.database().ref(chartPath);
// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector("#cards-div");
const gaugesReadingsElement = document.querySelector("#gauges-div");
const chartsDivElement = document.querySelector('#charts-div');
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const curElement = document.getElementById("cur");
const page2updateElement = document.getElementById("page2lastUpdate");

// MANAGE LOGIN/LOGOUT UI
let chartRange = 40;
let sensorQuery;
const setupUI = (user) => 
{
  chartRef.off('value');
  sensorQuery?.off('child_added');
  chartsRangeInputElement.onchange = null;
  page2updateElement.textContent = '—';
  if (!user) {
    for (const chart of [chartT, chartH, chartV, chartC, chartP]) chart?.destroy();
    chartT = chartH = chartV = chartC = chartP = undefined;
  }
  if (user) 
  {
    //toggle UI elements
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display ='block';
    userDetailsElement.style.display ='block';
    userDetailsElement.textContent = user.email;
    cardsReadingsElement.style.display = 'block';

    chartsDivElement.style.display = 'block';

    // CHARTS
    // Number of readings to plot on charts

    // Get number of readings to plot saved on database (runs when the page first loads and whenever there's a change in the database)
    const showReadError = () => { page2updateElement.textContent = 'Cannot read data. Check account access.'; };
    chartRef.on('value', snapshot =>
    {
      const value = Number(snapshot.val());
      chartRange = Number.isInteger(value) && value >= 1 && value <= 1000 ? value : 40;
      chartsRangeInputElement.value = chartRange;
      sensorQuery?.off('child_added');
      console.log(chartRange);
      // Delete all data from charts to update with new values when a new range is selected
      chartT?.destroy();
      chartH?.destroy();
      chartV?.destroy();
      chartC?.destroy();
      chartP?.destroy();
      // Render new charts to display new range of data
      chartT = createTemperatureChart();
      chartH = createHumidityChart();
      chartC = createCurrentChart();
      chartV = createVoltageChart();
      chartP = createPowerChart();
      // Update the charts with the new range
      // Get the latest readings and plot them on charts (the number of plotted readings corresponds to the chartRange value)
      sensorQuery = dbRefSensor.orderByKey().limitToLast(chartRange);
      sensorQuery.on('child_added', snapshot =>
      {
        var jsonData = snapshot.toJSON();
        // Save values on variables
        var temperature = jsonData.temperature;
        var humidity = jsonData.humidity;
        var volt = jsonData.voltage;
        var watt = jsonData.power;
        var amp = jsonData.current;
        var timestamp = jsonData.timestamp;
        // Plot the values on the charts
        plotValues(chartT, timestamp, temperature);
        plotValues(chartH, timestamp, humidity);
        plotValues(chartV, timestamp, volt);
        plotValues(chartC, timestamp, amp);
        plotValues(chartP, timestamp, watt);
        // Update DOM elements
        page2updateElement.textContent = epochToDateTime(timestamp);
      }, showReadError);
    }, showReadError);

    // Update database with new range (input field)
    chartsRangeInputElement.onchange = () =>{
      const value = chartsRangeInputElement.valueAsNumber;
      if (Number.isInteger(value) && value >= 1 && value <= 1000) {
        chartRef.set(value).catch(() => { chartsRangeInputElement.value = chartRange; });
      } else {
        chartsRangeInputElement.value = chartRange;
      }
    };
  // if user is logged out
  } 
  
  else
  {
    // toggle UI elements
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}