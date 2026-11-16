// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime)
{
  return new Date(epochTime*1000);
}
// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime)
{
  var epochDate = new Date(epochToJsDate(epochTime));
  var indexdateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);
  return indexdateTime;
}

var dbPathSensor = '/board1/Sensor';
var dbRefSensor = firebase.database().ref().child(dbPathSensor);
const indexhumElement = document.getElementById("indexhum");
const indexcurElement = document.getElementById("indexcur");
const indextempElement = document.getElementById("indextemp");
const indexvoltElement = document.getElementById("indexvolt");
const indexpowerElement = document.getElementById("indexpwr");
const indexfrequencyElement = document.getElementById("indexfre");
const indexpfElement = document.getElementById("indexfac");
const indexflameElement = document.getElementById("indexflame");
const indexupdateElement = document.getElementById("indexlastUpdate");

function latestReading(snapshot)
{
    var jsonData = snapshot.toJSON();
    var t = jsonData.temperature;
    var h = jsonData.humidity;
    var a = jsonData.current;
    var v = jsonData.voltage;
    var w = jsonData.power;
    var fre = jsonData.Freq;
    var pf = jsonData.PowerFactor ?? jsonData["Power Factor"];
    var flame = jsonData.FlameStatus;
    var tp = jsonData.timestamp;
    // Update DOM elements
    indextempElement.textContent = t ?? "—";
    indexhumElement.textContent = h ?? "—";
    indexcurElement.textContent = a ?? "—";
    indexpowerElement.textContent = w ?? "—";
    indexvoltElement.textContent = v ?? "—";
    indexfrequencyElement.textContent = fre ?? "—";
    indexpfElement.textContent = pf ?? "—";
    indexflameElement.textContent = flame ?? "—";
    indexupdateElement.textContent = epochToDateTime(tp);
}

function indexplotValues(chartIndex, timestamp, value1, value2, value3)
{
  var x = epochToJsDate(timestamp).getTime();
  var y = Number (value1);
  var y2 = Number (value2);
  var y3 = Number (value3);
  if(chartIndex.series[0].data.length >= 40) 
  {
    chartIndex.series[0].addPoint([x, y], true, true, true);
    chartIndex.series[1].addPoint ([x, y2], true, true, true);
    chartIndex.series[2].addPoint ([x, y3], true, true, true);
  } else {
    chartIndex.series[0].addPoint([x, y], true, false, true);
    chartIndex.series[1].addPoint ([x, y2], true, false, true);
    chartIndex.series[2].addPoint ([x, y3], true, false, true);
  }
}

let chartIndex;
function chartReading(snapshot)
{
    var json_Data = snapshot.toJSON();
    var amp = json_Data.current;
    var volt = json_Data.voltage;
    var watt = json_Data.power;
    /*
    var frequency = json_Data.Freq;
    var PowerFactor = json_Data.PowerFactor;
    */
    var t = json_Data.timestamp;
    indexplotValues(chartIndex, t, volt , amp ,watt );
}

function listenForReadings() {
  chartIndex = createIndexChart();
  const latest = dbRefSensor.orderByKey().limitToLast(1);
  const history = dbRefSensor.orderByKey().limitToLast(40);
  const showReadError = () => { indexupdateElement.textContent = 'Cannot read data. Check account access.'; };
  latest.on('child_added', latestReading, showReadError);
  history.on('child_added', chartReading, showReadError);
  return () => {
    latest.off('child_added', latestReading);
    history.off('child_added', chartReading);
    chartIndex.destroy();
    for (const element of [indextempElement, indexhumElement, indexcurElement, indexpowerElement,
      indexvoltElement, indexfrequencyElement, indexpfElement, indexflameElement, indexupdateElement]) {
      element.textContent = '—';
    }
  };
}
