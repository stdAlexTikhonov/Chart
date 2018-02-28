define(["qlik", "d3", "text!./chart.css", './properties'
],
  function (qlik, d3, cssContent, prop) {
    $("<style>").html(cssContent).appendTo("head");

    function barStack(seriesData) {
      var l = seriesData[0].length
      while (l--) {
        var posBase = 0; // positive base
        var negBase = 0; // negative base

        seriesData.forEach(function (d) {
          d = d[l]
          d.size = Math.abs(d.y)
          if (d.y < 0) {
            d.y0 = negBase
            negBase -= d.size
          } else {
            d.y0 = posBase = posBase + d.size
          }
        })
      }
      seriesData.extent = d3.extent(
        d3.merge(
          d3.merge(
            seriesData.map(function (e) {
              return e.map(function (f) { return [f.y0, f.y0 - f.size] })
            })
          )
        )
      )
    }
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
      support: {
        snapshot: true,
        exportData: true
      },
      paint: function ($element, layout) {

        var hc = layout.qHyperCube;
        var id = '_' + layout.qInfo.qId;

        $element.empty();
        if (layout.props.legend && layout.props.showTable) $element.append(`<ul id='${id}legend'></ul>`);
        $element.append("<svg class='chart' id='" + id + "'></svg><div class='" + id + "table'></div");


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
            causesLines.push({ title: hc.qMeasureInfo[i].qFallbackTitle, color: hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor, lineWidth: hc.qMeasureInfo[i].lineWidth, dashed: hc.qMeasureInfo[i].dashed });
          } else {
            causesBars.push({ title: hc.qMeasureInfo[i].qFallbackTitle, color: hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor });
            bartitles.push(hc.qMeasureInfo[i].qFallbackTitle);
          }
          legendColors.push({ color: hc.qMeasureInfo[i].color, textColor: hc.qMeasureInfo[i].textColor, meraLegend: hc.qMeasureInfo[i].meraLegend });

        }

        if (hc.qDimensionInfo.length > 1) {
          allMeasures.splice(1), causesBars = [], bartitles = [];
          hc.qDataPages[0].qMatrix.forEach(e => {
            allMeasures.push(e[1].qText);
            bartitles.push(e[1].qText);
            causesBars.push({ title: e[1].qText, color: 'lightblue', textColor: 'black' })
          })
        }

        console.log(allMeasures, causesBars, bartitles)
        var totals = [];

        for (var r = 0; r < hc.qDataPages[0].qMatrix.length; r++) {
          // iterate over all cells within a row
          var arr = hc.qDataPages[0].qMatrix[r];

          total = 0;
          totalNegstive = 0;
          row = {};
          for (var c = 0; c < arr.length; c++) {
            if (c == 0) row[allMeasures[c]] = hc.qDataPages[0].qMatrix[r][c].qText;
            else {
              row[allMeasures[c]] = hc.qDataPages[0].qMatrix[r][c].qNum;
              row[allMeasures[c] + '_f'] = hc.qDataPages[0].qMatrix[r][c].qText;
              if (bartitles.indexOf(allMeasures[c]) > -1) {
                if (row[allMeasures[c]] < 0) {
                  totalNegstive += row[allMeasures[c]];
                } else total += row[allMeasures[c]];
              }
            }

            //если есть 2я линия
            if (c == 2) {
              let lastPoint;
              if (r > 0) lastPoint = data[r - 1].diff;
              if (row[allMeasures[1]] - row[allMeasures[2]] > 0) {
                row['diff'] = -1;
              } else if (row[allMeasures[1]] - row[allMeasures[2]] == 0) {
                row['diff'] = lastPoint;
              } else {
                row['diff'] = 1;
              }

            }

          }
          data.push(row);
          totals.push(totalNegstive);
          totals.push(total);
        }


        var dimension = allMeasures[0];
        allMeasures = allMeasures.slice(1);

        var maxY = d3.max(allMeasures.map(function (c) {
          return d3.max(data.map(function (d) {
            return d[c];
          }));
        }));

        var minY = d3.min(allMeasures.map(function (c) {
          return d3.min(data.map(function (d) {
            return d[c];
          }));
        }));


        var stackMaxY = d3.max(totals);

        var stackMinY = d3.min(totals);

        //   minY = minY > 0 ? 0: minY;

        maxY = maxY < 0 ? 0 : maxY;

        stackMinY = stackMinY > 0 ? 0 : stackMinY;


        var lines = causesLines.map(function (c, line_i) {
          return data.map(function (d) {
            return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor, textAlign: d['diff'], lineIndex: line_i == 0 ? -1 : 1 };
          });
        });





        if (layout.props.typeBar == "stacked") {
          maxY = stackMaxY;
          minY = stackMinY;
          // d3.layout.stack()(
          var stacked = causesBars.map(function (c) {
            return data.map(function (d) {
              return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor };
            });
          });
          if (causesBars.length > 0) barStack(stacked);
        } else {
          var grouped = causesBars.map(function (c) {
            return data.map(function (d) {
              return { x: d[dimension], y: d[c.title], formatted: d[c.title + '_f'], textColor: c.textColor };
            });
          });
        }


        var margin = { top: 20, right: 0, bottom: 17, left: 60 };



        //Оси + заголовки
        var titleX = layout.props.titleX ? 15 : 0;




        if (layout.props.axisX) margin.bottom = 17;
        else margin.bottom = 0;


        if (layout.props.axisY) {
          margin.left = 60;
        } else {
          margin.left = 0;
        }

        if (layout.props.titleX) {
          margin.bottom += titleX;
        } else {
          margin.bottom -= titleX;
        }


        d3.select("#" + id).style("width", "100%")
        var w = parseInt(d3.select("#" + id).style("width"));
        //var width = w - margin.left - margin.right;
        var width = w;

        d3.select("#" + id).style('height', "98%");

        var h = parseInt(d3.select("#" + id).style("height"));
        //var height = h - margin.top - margin.bottom;
        var height = h;

        if (layout.props.showTable) {
          height -= ((layout.props.tableHeader ? 50 : 30) + layout.props.lineFontSize);
          d3.select("#" + id).style('height', `${height}px`);
        }

        if (layout.props.legend) {
          height -= 25;
          d3.select("#" + id).style('height', `${height}px`);
        }


        var x = d3.scale.ordinal()
          .domain(data.map(function (d) { return d[dimension]; }))
          .rangeBands([layout.props.axisY && !hc.qMeasureInfo[0].line ? 30 + layout.props.axisFontSize * 2 : 0, width], 0.1);

        //На случай grouped
        var x1 = d3.scale.ordinal()
          .domain(d3.range(causesBars.length))
          .rangeBands([0, x.rangeBand()]);


        let minHeight = height - 10 - (layout.props.axisX == 1 ? (20 + layout.props.axisFontSize / 2) : 0) - layout.props.lineTextOffset,
          maxHeight = 10 + layout.props.lineTextOffset;


        var y = d3.scale.linear()
          .domain([minY, maxY])
          .range([minHeight, maxHeight]);




        var valueline = d3.svg.line()
          .x(function (d) { return x(d.x) + x.rangeBand() / 2; })
          .y(function (d) { return y(d.y) })


        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");



        //выводим картинку
        // var chart = d3.select("#" + id)
        //   .attr("width", width + margin.left + margin.right)
        //   .attr("height", height + margin.top + margin.bottom)
        //   .append("g")
        //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var chart = d3.select("#" + id)
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(0,0)");

        //Столбцы
        if (layout.props.typeBar == "stacked") {
          var rects = chart.selectAll(".layer")
            .data(stacked)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function (d, i) { return causesBars[i].color; })


          rects.selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.x); })
            .attr("y", function (d) { return y(d.y0); }) //y(d.y + d.y0);
            .attr("height", function (d) { return y(0) - y(d.size); })//y(d.y0) - y(d.y + d.y0);
            .attr("width", x.rangeBand() - 1);

          if (layout.props.barsValues) {
            rects.selectAll('text')
              .data(function (d) {
                return d;
              })
              .enter().append('g')
              .attr("transform", function (d) {
                // if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "middle") {
                //   return "translate(" + x(d.x)  +"," + (y(d.y/2)) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "middle") {
                //   return "translate(" + (x(d.x) + x.rangeBand()/2) +"," +y( d.y/2) +")";
                // } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "middle" ) {
                //   return "translate(" + (x(d.x) + x.rangeBand()) +"," + (y(d.y/2) + y(d.y0)) +")";
                // if( layout.props.barValHorizontalAlign == "left" ) {
                //   return "translate(" + (x(d.x)+layout.props.barFontSize*1.5)  +"," + (y(d.y0)+layout.props.barFontSize*1.1) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center") {
                if (layout.props.barValVerticalAlign == "middle") {
                  if (d.y < 0) return "translate(" + (x(d.x) + x.rangeBand() / 2) + "," + (y(d.y0 + d.y / 2) + layout.props.barFontSize * 0.5 + layout.props.barTextOffset * -1) + ")";
                  else return "translate(" + (x(d.x) + x.rangeBand() / 2) + "," + (y(d.y0 - d.y / 2) + layout.props.barFontSize * 0.5 + layout.props.barTextOffset) + ")";
                } else {
                  if (d.y < 0) return "translate(" + (x(d.x) + x.rangeBand() / 2) + "," + (y(d.y0 + d.y) + layout.props.barFontSize * -0.5 + layout.props.barTextOffset * -1) + ")";
                  else return "translate(" + (x(d.x) + x.rangeBand() / 2) + "," + (y(d.y0) + layout.props.barFontSize * 1.1 + layout.props.barTextOffset) + ")";
                }
                // } else if ( layout.props.barValHorizontalAlign == "right") {
                //   return "translate(" + ((x(d.x) + x1.rangeBand())-+layout.props.barFontSize*1.5) +"," + (y(d.y0)+layout.props.barFontSize*1.5) +")";
                // }
                // } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "bottom") {
                //   return "translate(" + x(d.x)  +"," + y(0) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "bottom") {
                //   return "translate(" + (x(d.x) + x.rangeBand()/2) +"," + y(d.y0 + d.y) +")";
                // } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "bottom" ) {
                //   return "translate(" + (x(d.x) + x.rangeBand()) +"," + y(0) +")";
                // }

              })
              //.attr("text-anchor", "middle")
              .attr('display', function (d) {
                if (Math.abs(y(0) - y(d.size)) < 15) return 'none';
              })
              .append('text')

              // .attr("text-anchor", function(d) {
              //   if ( x.rangeBand() < 50 && d.y > 0 ) return "end";
              //   else if (x.rangeBand() < 50 && d.y > 0 ) return "start";
              //   else return "middle";
              // })
              .attr("text-anchor", "middle")
              .text(function (d, i) {
                if (!isNaN(d.y)) return d.formatted;
              })
              .style('font-size', layout.props.barFontSize)
              .style('font-weight', function (d) {
                if (layout.props.barFontWeight) return 'bold';
              })
              .style('fill', function (d) { return d.textColor; })
              .attr("transform", "rotate(" + layout.props.barValAngle + ")")
              .attr("dy", function (d) {
                if (layout.props.barValAngle == 0) return 0
                else return 3;
              });

          }

        } else {
          var rects = chart.append("g").selectAll("g")
            .data(grouped)
            .enter().append("g")
            .style("fill", function (d, i) { return causesBars[i].color; })
            .attr("transform", function (d, i) { return "translate(" + x1(i) + ",0)"; });

          rects.selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("height", function (d) {
              if (d.y >= 0) return y(0) - y(d.y);
              else return y(d.y) - y(0);
            }) //y(d.y) - y(0); - negative
            .attr("x", function (d, i) { return x(d.x); })
            .attr("y", function (d) {
              if (d.y >= 0) return y(d.y);
              else return y(0);
            });//y(0) - negative


          if (layout.props.barsValues) {
            rects.selectAll("text")
              .data(function (d) {
                return d;
              })
              .enter().append('g')
              // .attr("transform", function(d) { return "translate(" + (x(d.x))  +"," + (y(d.y/2)) +")"; })
              .attr("transform", function (d) {
                // if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "middle") {
                //   return "translate(" + x(d.x)  +"," + y(d.y/2) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "middle") {
                //   return "translate(" + (x(d.x) + x1.rangeBand()/2) +"," + y(d.y/2) +")";
                // } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "middle" ) {
                //   return "translate(" + (x(d.x) + x1.rangeBand()) +"," + y(d.y/2) +")";
                // if( layout.props.barValHorizontalAlign == "left") {
                //   return "translate(" + (x(d.x)+layout.props.barFontSize*1.5)  +"," + (y(d.y)+layout.props.barFontSize*1.5) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center") {

                if (layout.props.barValVerticalAlign == "middle") {
                  if (d.y < 0) return "translate(" + (x(d.x) + x1.rangeBand() / 2) + "," + (y(0 + d.y / 2) + layout.props.barFontSize * -0.5 + layout.props.barTextOffset * -1) + ")";
                  else return "translate(" + (x(d.x) + x1.rangeBand() / 2) + "," + (y(0 + d.y / 2) + layout.props.barFontSize * 0.5 + layout.props.barTextOffset) + ")";
                } else {
                  if (d.y < 0) return "translate(" + (x(d.x) + x1.rangeBand() / 2) + "," + (y(d.y) + layout.props.barFontSize * -0.9 + layout.props.barTextOffset * -1) + ")";
                  else return "translate(" + (x(d.x) + x1.rangeBand() / 2) + "," + (y(d.y) + layout.props.barFontSize * 1.1 + layout.props.barTextOffset) + ")";
                }
                // } else if ( layout.props.barValHorizontalAlign == "right") {
                //   return "translate(" + ((x(d.x) + x1.rangeBand())+layout.props.barFontSize*1.5) +"," + (y(d.y)+layout.props.barFontSize*1.5) +")";
                // }
                // } else if( layout.props.barValHorizontalAlign == "left" && layout.props.barValVerticalAlign == "bottom") {
                //   return "translate(" + x(d.x)  +"," + y(0) +")";
                // } else if ( layout.props.barValHorizontalAlign == "center"  && layout.props.barValVerticalAlign == "bottom") {
                //   return "translate(" + (x(d.x) + x1.rangeBand()/2) +"," + y(0) +")";
                // } else if ( layout.props.barValHorizontalAlign == "right"  && layout.props.barValVerticalAlign == "bottom" ) {
                //   return "translate(" + (x(d.x) + x1.rangeBand()) +"," + y(0) +")";
                // }
              })
              .append('text')
              .attr('display', function (d) {
                if (Math.abs(y(0) - y(d.y)) < 15) return 'none';
              })
              .attr("text-anchor", "middle")
              // .attr("text-anchor", function(d) {
              //   if ( x.rangeBand() < 50 ) return "end";
              //   else return "middle";
              // })

              .text(function (d) {
                if (!isNaN(d.y)) return d.formatted;
              })
              .style('font-size', layout.props.barFontSize)
              .style('font-weight', function (d) {
                if (layout.props.barFontWeight) return 'bold';
              })
              .style('fill', function (d) { return d.textColor; })
              .attr("transform", "rotate(" + layout.props.barValAngle + ")")
              .attr("dy", function (d) {
                if (layout.props.barValAngle == 0) return 0
                else return 3;
              });
          }
        }

        // //Оси
        if (layout.props.axisX == 1) {

          chart.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - ((hc.qMeasureInfo[0].line ? 15 : 30) + layout.props.axisFontSize / 2)})`)
            .call(xAxis)
        } else {
          chart.select('x ')
            .style("display", 'none')
        }

        if (layout.props.axisY == 1 && !hc.qMeasureInfo[0].line) {
          chart.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${30 + layout.props.axisFontSize * 2},0)`)
            .call(yAxis)
        } else if (layout.props.axisY == 0) {
          chart.select('y')
            .style("display", 'none')
        }

        $('.axis text').css({ 'fill': '#707070', 'font': `${layout.props.axisFontSize}px sans-serif`, 'font-weight': layout.props.axisFontWeight ? 'bold' : 'normal' });
        $('.axis path, .axis line').css({ 'fill': 'none', 'stroke': '#CCC', 'shape-rendering': 'crispEdges' });


        d3.select("#" + id).append('text')
          .text(hc.qDimensionInfo[0].qFallbackTitle)
          .attr('x', width / 2 + margin.left)
          .attr('y', height + margin.top + margin.bottom)
          .attr("text-anchor", "middle")
          .style('display', function () {
            if (layout.props.titleX == false)
              return 'none';
          })


        //Линии

        if (lines.length > 0 && !isNaN(lines[0][0].y)) {//lines[0].y - может быть undefined поэтому !undefined == true !!undefined == false

          lines = lines.map(function (line) {
            return line.filter(function (dot) {
              return dot.y != 'NaN' && dot.y != NaN;
            });
          });


          var line = chart.selectAll('.line')
            .data(lines)
            .enter().append("path")
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', function (d, i) {
              return causesLines[i].color;
            })
            .attr('stroke-width', function (d, i) {
              return causesLines[i].lineWidth;
            })
            .attr("d", function (d, i) {
              valueline.interpolate(shape[i]);
              return valueline(d);
            })
            .style("stroke-dasharray", function (d, i) {
              return causesLines[i].dashed;
            });



          if (layout.props.circles) {
            var circles = chart.selectAll('.circles')
              .data(lines)
              .enter().append('g')
              .attr('class', 'circles')
              .attr('stroke', function (d, i) {
                return causesLines[i].color;
              })
              .attr('fill', function (d, i) {
                if (layout.props.fillPoints) return causesLines[i].color;
                else return 'none';
              })

            circles.selectAll('circle')
              .data(function (d) { return d; })
              .enter().append('circle')
              .attr("cx", function (d) {
                return x(d.x) + x.rangeBand() / 2;
              })
              .attr('cy', function (d) {
                return y(d.y);
              })
              .attr('r', layout.props.radius)

              .attr('stroke-width', layout.props.lineWidth)
          }


          if (layout.props.values) {


            var valLine = chart.selectAll(".values")
              .data(lines)
              .enter().append('g')
              .attr('class', 'values')

            let ys;


            valLine.selectAll('.textg')
              .data(function (d) {
                ys = d;
                return d;
              })
              .enter().append('g')
              .attr("transform", function (d, i) {
                let current_x = x(d.x) + x.rangeBand() / 2,
                  current_y = y(d.y) + layout.props.lineFontSize / 2,
                  prev_y = i > 0 ? y(ys[i - 1].y) : 0;
                // console.log('current: ', current_x, current_x - d.formatted.length * layout.props.lineFontSize / 4);
                // if (i > 0) {
                //   let prev = ys[i - 1],
                //     prev_x = x(ys[i - 1].x) + x.rangeBand() / 2;
                //   console.log('prev: ', prev_x, prev_x + prev.formatted.length * layout.props.lineFontSize / 4);

                // }
                // console.log(y(d.y), prev_y);
                return `translate(${current_x},${current_y})`;
              })
              .attr('class', 'textalign')
              .append('text')
              .attr('class', 'textg')
              .attr("text-anchor", layout.props.lineTextAlign)
              .attr("transform", "rotate(" + layout.props.lineValAngle + ")")
              .attr('dy', function (d, i) { return -layout.props.lineTextOffset * d.textAlign * d.lineIndex })
              .text(function (k, i) {
                return k.formatted;
              })
              .style('font-size', layout.props.lineFontSize)
              .style('font-weight', function (d) {
                if (layout.props.lineFontWeight) return 'bold';
              })
              .style('fill', function (d) { return d.textColor; })

          }

        }

        if (layout.props.legend && !layout.props.showTable) $element.append(`<ul id='${id}legend'></ul>`);
        if (layout.props.legend) {


          legend = d3.select("#" + id + "legend")
            .style({ margin: 0, padding: 0, width: '100%' })
            .style('text-align', layout.props.showTable ? 'center' : 'left')
            .style("margin", "3px 10px")


          var li = legend.selectAll('li')
            .data(allMeasures.slice())
            .enter().append("li")
            .text(function (d, i) {
              if (legendColors[i].meraLegend != undefined && legendColors[i].meraLegend != "") {
                return legendColors[i].meraLegend;
              }
              return d;
            })
            .style("display", "inline-block")
            .style({ margin: 0, padding: 0 })
            .style("margin-left", "10px")
            .style('padding-left', '5px')
            .style('border-left-style', 'solid')
            .style("border-width", "10px")
            .style('border-color', function (d, i) {
              return legendColors[i].color;
            })
            .style("color", "black")
            .style('font-size', layout.props.lgFontSize + 'px')
            .style('font-weight', layout.props.lgFontWeight ? 'bold' : 'normal')
            .style('line-height', function (d, i) {
              if (hc.qMeasureInfo[i].line) return "3px";
              else return "10px";
            })


        }
        console.log(lines);
        let table = `<table style='
        margin: 0 auto;
        width: ${width};
        text-align: center;
        font-size: ${layout.props.lineFontSize}px; 
        font-weight: ${layout.props.lineFontWeight ? 'bold' : 'normal'};'>`;
        for (let i = 0; i < lines.length; i++) {
          if (i === 0 && layout.props.tableHeader) {
            table += `<tr>`;
            lines[i].forEach(d => {
              table += `<td style="color: black; width: ${width / lines[i].length}px;">${d.x}</td>`
            });
            table += `</tr>`;
          }
          table += `<tr>`;
          lines[i].forEach(d => {
            table += `<td style="color: ${d.textColor}; width: ${width / lines[i].length}px;">${d.formatted}</td>`
          });
          table += `</tr>`;
        }

        table += `</table>`;

        if (layout.props.showTable) $element.append(table);


        //   var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
        //   var canvas = document.getElementById("canvas");
        //   var ctx = canvas.getContext("2d");
        //   var DOMURL = self.URL || self.webkitURL || self;
        //   var img = new Image();
        //   var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        //   var url = DOMURL.createObjectURL(svg);
        //   img.onload = function() {
        //       ctx.drawImage(img, 0, 0);
        //       var png = canvas.toDataURL("image/png");
        //       document.querySelector('#png-container' + id).innerHTML = '<img src="'+png+'"/>';
        //       DOMURL.revokeObjectURL(png);
        //   };
        //   img.src = url;

        return qlik.Promise.resolve();


      }



    };
  });
