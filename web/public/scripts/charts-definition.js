let chartT, chartH, chartC, chartV, chartP;

// Create Temperature Chart
function createTemperatureChart() {
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-temperature',
      type: 'spline' 
    },
    series: [
      {
        name: 'DHT22 Sensor'
      }
    ],
    title: { 
      text: undefined
    },
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S'},
    },
    yAxis: {
      title: { 
        text: 'Temp(°C)'
      }
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
    timezoneOffset: 7 * 60
    },
    rangeSelector: 
    {
      buttons: [{
        type: 'day',
        count: 1,
        text: 'Day'
      }, {
        type: 'month',
        count: 1,
        text: 'Mounth'
      }, {
        type: 'year',
        count: 1,
        text: 'Year'
      }, {
        type: 'all',
        text: 'All The Time'
      }],
      inputEnabled: false, // it supports only days
      selected: 4 // all
    },
  });
  return chart;
}
// Create Humidity Chart
function createHumidityChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-humidity',
      type: 'spline'  
    },
    series: [{
      name: 'DHT22 Sensor'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#50b8b4' 
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Humid(%)' 
      }
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
      timezoneOffset: 7 * 60}
  });
  return chart;
}
// Create Voltage Chart
function createVoltageChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-voltage',
      type: 'spline'  
    },
    series: [{
      name: 'PZEM Sensor'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
        enabled: true 
        }
      },
      series: { 
        color: '#df0d57' 
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Voltage(V)' 
      }
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
      timezoneOffset: 7 * 60}
  });
  return chart;
}
// Create Current Chart
function createCurrentChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-current',
      type: 'spline'  
    },
    series: [{
      name: 'PZEM Sensor'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#d2e902' 
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Current(A)'
      }
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
      timezoneOffset: 7 * 60}
  });
  return chart;
}
// Create Power Chart
function createPowerChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-power',
      type: 'spline'  
    },
    series: [{
      name: 'PZEM Sensor'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#170097' 
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Power (W)'
      }
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
      timezoneOffset: 7 * 60}
  });
  return chart;
}