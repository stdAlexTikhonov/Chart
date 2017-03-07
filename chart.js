define( [ "qlik", "d3", "text!./chart.css",'./properties'
],
function ( qlik, d3, cssContent,  prop) {
  $( "<style>" ).html( cssContent ).appendTo( "head" );
  return {
    definition: prop,
    initialProperties: {
         qHyperCubeDef: {
                  qDimensions: [],
                  qMeasures: [],
                  qInitialDataFetch: [
                      {
                          qWidth: 10,
                          qHeight: 100
                      }
                  ]
          }
    },
    support : {
      snapshot: true,
      exportData: true
    },
    paint: function ($element, layout) {

      var hc = layout.qHyperCube;
      var id = '_' + layout.qInfo.qId;

      $element.empty();
      $element.append("<svg class='chart' id='"+ id +"'></svg><ul id='"+ id +"legend'></ul>");



//Подготовка данных

      var causesLines = [];
      var causesBars = [];
      var allMeasures = [];
      var data = [];
      var shape = [];
      var bartitles = [];
      var legendColors = [];


      allMeasures.push(hc.qDimensionInfo[0].qFallbackTitle);
      for (var i = 0; i < hc.qMeasureInfo.length; i++) {
         allMeasures.push(hc.qMeasureInfo[i].qFallbackTitle)
         if (hc.qMeasureInfo[i].line) {
           shape.push(hc.qMeasureInfo[i].lineShape);
           causesLines.push({ title: hc.qMeasureInfo[i].qFallbackTitle, color: hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor });
         }  else {
           causesBars.push({ title: hc.qMeasureInfo[i].qFallbackTitle, color:  hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor });
           bartitles.push(hc.qMeasureInfo[i].qFallbackTitle);
         }
         legendColors.push({ color:hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor });

      }

      var totals = [];

      for (var r = 0; r < hc.qDataPages[0].qMatrix.length; r++) {
        // iterate over all cells within a row
            var arr = hc.qDataPages[0].qMatrix[r];

            total = 0;
            row = {};
            for (var c = 0; c < arr.length; c++) {
              if ( c == 0 ) row[allMeasures[c]] = hc.qDataPages[0].qMatrix[r][c].qText;
              else {
                row[allMeasures[c]] = hc.qDataPages[0].qMatrix[r][c].qNum;
                row[allMeasures[c] + '_f'] = hc.qDataPages[0].qMatrix[r][c].qText;
                if (bartitles.indexOf(allMeasures[c]) > -1) total += row[allMeasures[c]];
              }
            }
            data.push(row);
            totals.push(total);
          }


          var dimension = allMeasures[0];
          allMeasures = allMeasures.slice(1);


          var maxY = d3.max(allMeasures.map(function(c){
            return d3.max(data.map(function(d) {
              return d[c];
            }));
          }));

          var minY = d3.min(allMeasures.map(function(c){
            return d3.min(data.map(function(d) {
              return d[c];
            }));
          }));

          var stackMaxY = d3.max(totals);
          var stackMinY = d3.min(totals);


          var lines = causesLines.map(function(c) {
            return data.map(function(d){
              return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor};
            });
          });





          if(layout.props.typeBar == "stacked") {
            var stacked = d3.layout.stack()(causesBars.map(function(c) {
              return data.map(function(d) {
                return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor};
              });
            }));
          } else {
            var grouped = causesBars.map(function(c) {
              return data.map(function(d){
                return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor};
              });
            });
          }


          var margin = {top: 20, right: 0, bottom: 17, left: 60};



//Оси + заголовки
          var titleX = layout.props.titleX?15:0;




          if ( layout.props.axisX ) margin.bottom = 17;
          else margin.bottom = 0;


          if ( layout.props.axisY) {
            margin.left = 60;
          } else {
            margin.left = 0;
          }

          if ( layout.props.titleX ) {
            margin.bottom += titleX;
          } else {
             margin.bottom -= titleX;
          }


          var w =  parseInt(d3.select("#" + id).style("width"));
          var width = w - margin.left - margin.right;

          if (layout.props.legend) d3.select("#"+id).style('height', "90%");
          else d3.select("#"+id).style('height', "100%");

          var h = parseInt(d3.select("#" + id).style("height"));
          var height = h - margin.top - margin.bottom;

          $element.append("<canvas id='canvas' width='"+ w +"' height='"+ h +"'></canvas>");
          $element.append("<div id='png-container'></div>");

          var x = d3.scale.ordinal()
            .domain(data.map(function(d) { return d[dimension]; }))
            .rangeBands([0, width], 0.1);

          //На случай grouped
          var x1 = d3.scale.ordinal()
              .domain(d3.range(causesBars.length))
              .rangeBands([0, x.rangeBand()]);


          var y = d3.scale.linear()
            .domain([function() {
              if (stackMinY < minY) return stackMinY;
              else return minY;
            }(), function() {
              if (stackMaxY > maxY) return stackMaxY;
              else return maxY;
            }()])
            .range([height, 0]);

          var z = d3.scale.category10();


          var valueline = d3.svg.line()
              .x(function(d) {  return x(d.x) + x.rangeBand()/2; })
              .y(function(d) {  return y(d.y) })



          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");



//выводим картинку
          var chart = d3.select("#" + id)
  				  .attr("width", width + margin.left + margin.right)
  				  .attr("height", height + margin.top + margin.bottom)
  				.append("g")
  				  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Оси
          if (layout.props.axisX == 1) {
  					chart.append("g")
  						.attr("class", "x axis")
  						.attr("transform", "translate(0," + y(0) + ")")
  						.call(xAxis)
  				} else {
  					chart.select('x ')
  						.style("display", 'none')
  				}

          if (layout.props.axisY == 1) {
            chart.append("g")
              .attr("class", "y axis")
              .call(yAxis)
          } else if (layout.props.axisY == 0) {
            chart.select('y')
              .style("display", 'none')
          }

          $('.axis text').css({'fill':'#707070', 'font': '10px sans-serif'});
          $('.axis path, .axis line').css({ 'fill': 'none','stroke':'#CCC', 'shape-rendering':'crispEdges'});


          d3.select("#" + id).append('text')
            .text(hc.qDimensionInfo[0].qFallbackTitle)
            .attr('x', width/2 + margin.left)
            .attr('y', height+margin.top+margin.bottom)
            .attr("text-anchor", "middle")
            .style('display', function() {
              if ( layout.props.titleX == false )
              return 'none';
            })

//Столбцы
      if(layout.props.typeBar == "stacked") {
        var rects = chart.selectAll(".layer")
            .data(stacked)
          .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) { return causesBars[i].color; })


          rects.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y + d.y0); })
            .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
            .attr("width", x.rangeBand() - 1);

          if ( layout.props.barsValues ) {
            rects.selectAll('text')
              .data(function(d) {
                return d;
               })
              .enter().append('g')
              .attr("transform", function(d) {
                if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "middle") {
                  return "translate(" + x(d.x)  +"," + (y(d.y/2 + d.y0)) +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "middle") {
                  return "translate(" + (x(d.x) + x.rangeBand()/2) +"," + (y(d.y/2 + d.y0)) +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "middle" ) {
                  return "translate(" + (x(d.x) + x.rangeBand()) +"," + (y(d.y/2 + d.y0)) +")";
                } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "top") {
                  return "translate(" + x(d.x)  +"," + (y(d.y + d.y0)+layout.props.barFontSize) +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "top") {
                  return "translate(" + (x(d.x) + x.rangeBand()/2) +"," + (y(d.y + d.y0)+layout.props.barFontSize) +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "top" ) {
                  return "translate(" + (x(d.x) + x.rangeBand()) +"," + (y(d.y + d.y0)+layout.props.barFontSize) +")";
                } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "bottom") {
                  return "translate(" + x(d.x)  +"," + y(d.y0) +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "bottom") {
                  return "translate(" + (x(d.x) + x.rangeBand()/2) +"," + y(d.y0) +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "bottom" ) {
                  return "translate(" + (x(d.x) + x.rangeBand()) +"," + y(d.y0) +")";
                }

              })
              .attr('display', function(d) {
                if(( height - y(d.y)) < 15) return 'none';
              })
              .append('text')
              // .attr("x", function(d) { return x(d.x) + x.rangeBand()/2 ; })
              // .attr("y", function(d) { return y(d.y/2 + d.y0)+ 10; })
              .attr("text-anchor", function(d) {
                if( layout.props.barValHorizontalAlign == "left") {
                  return "start";
                } else if ( layout.props.barValHorizontalAlign == "center") {
                  return "middle";
                } else {
                  return "end";
                }
              })
              .text(function(d,i) {
                return d.formatted;
              })
              .style('font-size', layout.props.barFontSize)
              .style('font-weight', function(d) {
                if ( layout.props.barFontWeight) return 'bold';
              })
              .style('fill', function(d) { return d.textColor; })
              .attr("transform", "rotate("+ layout.props.barValAngle +")")
          }

      } else {
        var rects = chart.append("g").selectAll("g")
            .data(grouped)
          .enter().append("g")
            .style("fill", function(d, i) {  return causesBars[i].color; })
            .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; });

          rects.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("height", function(d) { return height - y(d.y); })
            .attr("x", function(d, i) { return x(d.x); })
            .attr("y", function(d) { return  y(d.y); });


          if ( layout.props.barsValues ) {
            rects.selectAll("text")
              .data(function(d) {
                 return d; })
              .enter().append('g')
              // .attr("transform", function(d) { return "translate(" + (x(d.x))  +"," + (y(d.y/2)) +")"; })
              .attr("transform", function(d) {
                if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "middle") {
                  return "translate(" + x(d.x)  +"," + y(d.y/2) +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "middle") {
                  return "translate(" + (x(d.x) + x1.rangeBand()/2) +"," + y(d.y/2) +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "middle" ) {
                  return "translate(" + (x(d.x) + x1.rangeBand()) +"," + y(d.y/2) +")";
                } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "top") {
                  return "translate(" + x(d.x)  +"," + (y(d.y)+layout.props.barFontSize) +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "top") {
                  return "translate(" + (x(d.x) + x1.rangeBand()/2) +"," + (y(d.y)+layout.props.barFontSize) +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "top" ) {
                  return "translate(" + (x(d.x) + x1.rangeBand()) +"," + (y(d.y)+layout.props.barFontSize) +")";
                } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "bottom") {
                  return "translate(" + x(d.x)  +"," + height +")";
                } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "bottom") {
                  return "translate(" + (x(d.x) + x1.rangeBand()/2) +"," + height +")";
                } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "bottom" ) {
                  return "translate(" + (x(d.x) + x1.rangeBand()) +"," + height +")";
                }
              })
              .append('text')
              .attr('display', function(d) {
                if(( height - y(d.y)) < (layout.props.barFontSize + 5)) return 'none';
              })
              .attr("text-anchor", function(d) {
                if( layout.props.barValHorizontalAlign == "left") {
                  return "start";
                } else if ( layout.props.barValHorizontalAlign == "center") {
                  return "middle";
                } else {
                  return "end";
                }
              })
              .text(function(d) {
                return d.formatted;
              })
              .style('font-size', layout.props.barFontSize)
              .style('font-weight', function(d) {
                if ( layout.props.barFontWeight) return 'bold';
              })
              .style('fill', function(d) { return d.textColor; })
              .attr("transform", "rotate("+ layout.props.barValAngle +")")
          }
      }




//Линии
      if(lines.length > 0) {

      // for(var i = 0; i < lines.length; i++ ){
        var line = chart.selectAll('.line')
            .data(lines)
            .enter().append("path")
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', function(d,i) {
              return causesLines[i].color;
            })
            .attr('stroke-width', layout.props.lineWidth )
            .attr("d", function(d, i) {
              valueline.interpolate(shape[i]);
              return valueline(d);
            })
            .style("stroke-dasharray", layout.props.dashed);
      if ( layout.props.circles ) {
        var circles = chart.selectAll('.circles')
              .data(lines)
              .enter().append('g')
              .attr('class', 'circles')
              .attr('stroke', function(d,i) {
                return causesLines[i].color;
              })
              .attr('fill', function(d,i) {
                if(layout.props.fillPoints) return causesLines[i].color;
                else return 'none';
              })

        circles.selectAll('circle')
              .data(function(d) { return d; })
              .enter().append('circle')
              .attr("cx", function(d){
                return x(d.x) + x.rangeBand()/2;
              })
              .attr('cy', function(d) {
                 return y(d.y);
              })
              .attr('r', layout.props.radius)

              .attr('stroke-width',layout.props.lineWidth)
      }



if ( layout.props.values ) {
  var valLine = chart.selectAll(".values")
       .data(lines)
       .enter().append('g')
       .attr('class','values')



  valLine.selectAll('.textg')
      .data(function(d) { return d; })
      .enter().append('g')
      .attr("transform", function(d) { return "translate(" + (x(d.x) + x.rangeBand()/2) +"," + (y(d.y)) +")"; })
      .append('text')
      .attr('class', 'textg')
      .attr("text-anchor", layout.props.lineTextAlign)
      .attr("transform", "rotate("+ layout.props.lineValAngle +")")
      .attr('dy', layout.props.lineTextOffset * -1)
      // .attr('dy', -20)
      .text(function(k,i) {
        return k.formatted;
      })
      .style('font-size', layout.props.lineFontSize)
      .style('font-weight', function(d) {
        if ( layout.props.lineFontWeight) return 'bold';
      })
      .style('fill', function(d) { return d.textColor; })
}



}







if (layout.props.legend) {
      legend = d3.select("#" + id + "legend")
            .style({margin:0, padding:0})
            .style("margin-left", margin.left + "px")


     var li = legend.selectAll('li')
     .data(allMeasures.slice())
     .enter().append("li")
     .text(function(d) { return  d; })
     .style("display", "inline-block")
     .style({margin:0, padding:0})
     .style("margin-left","5px")
     .style('border-left-style','solid')
     .style("border-width", layout.props.lgOffset + "px")
     .style('border-color', function(d,i) {
       return legendColors[i].color;
     })
    //  .style("color", function(d,i) {
    //    return legendColors[i].textColor;
    //  })
    .style("color", "black")
    .style('font-size', layout.props.lgFontSize + 'px')
     .style("padding", "0.5%")




      }


      var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      var DOMURL = self.URL || self.webkitURL || self;
      var img = new Image();
      var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
      var url = DOMURL.createObjectURL(svg);
      img.onload = function() {
          ctx.drawImage(img, 0, 0);
          var png = canvas.toDataURL("image/png");
          document.querySelector('#png-container').innerHTML = '<img src="'+png+'"/>';
          DOMURL.revokeObjectURL(png);
      };
      img.src = url;

      return qlik.Promise.resolve();


}



  };
});
