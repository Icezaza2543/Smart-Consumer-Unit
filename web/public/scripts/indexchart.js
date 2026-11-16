function createIndexChart()
{
  var chartIndex = new Highcharts.Chart({
    chart:{ 
      renderTo:'indexmainchart',
      type: 'column'  
    },
    series: 
    [
      {name: 'Voltage',color: '#df0d57',marker: {symbol: 'square'} },
      {name: 'Current',color: '#d2e902',marker: {symbol: 'diamond'} },
      {name: 'Power',color: '#170097',marker: {symbol: 'triangle'} }
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
      },
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { text: 'All Values'}
    },
    credits: { 
      enabled: false 
    },
    time:{ useUTC: false, 
      timezoneOffset: 7 * 60}
  });
  return chartIndex;
}