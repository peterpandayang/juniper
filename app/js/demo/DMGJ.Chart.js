(function ($,d3) {
    DMGJ.namespace("DMGJ.D3Chart");
    var D3Chart = DMGJ.D3Chart;
    D3Chart.chart= (function () {
        var defaultConfig = {
            title:"",
            titleOffset:[300,40],
            titleStyle:{
                "text-anchor":'middle',
                "font-size":20,
                "stroke":'red',
                "fill":'aqua'
            },
            type:"line",
            markerColor:d3.scale.category20(),
            chartColor:d3.scale.category20(),
            duration:500,
            nodeNum:20
        };

        return function (svg, options) {
            if(!(this instanceof DMGJ.D3Chart.chart)){
                // options here is the config in the chart
                return new DMGJ.D3Chart.chart(svg,options);
            }

            if(typeof svg === "string"){
                svg = "#"+svg;
            }

            // get the "#chart" element from the page and store it in svg variable
            this.svg = d3.select(svg);

            //defaultConfig's transform at bottom
            defaultConfig.transform ="translate(40," + (Number.parseInt($(svg).css("height").replace("px","")) - 20) + ")";

            this._options= $.extend(true, {}, defaultConfig, options);

            this._axisBasline = Number.parseInt(this._options.transform.replace("translate(","").replace(")", "")
                .split(",")[1],10);

            this._data={
                y:[],
                x:[]
            };

            //this.xAxis = this.svg.append('g');
            //add title here
            this.svg.append("text")
                .attr("transform", "translate("+this._options.titleOffset[0]+","+this._options.titleOffset[1]+")")
                .style(this._options.titleStyle)
                .text(this._options.title);

        }
    }());


    
    $.extend(DMGJ.D3Chart.chart.prototype,{
        /**
         * data={
         *      y:[integer,……],
         *      x:integer
         * }
         * @param data
         */
        render:function (data) {
            //add data
            var _data = this._data;
            _data.x.push(data.x);
            _data.y.push(data.y);
            //total 20 nodes
            if(_data.x.length > this._options.nodeNum){
                let len = _data.x.length;
                _data.x = _data.x.slice(len - this._options.nodeNum);
                _data.y = _data.y.slice(len - this._options.nodeNum);
            }
            this.svg.selectAll('g').remove();
            this.svg.selectAll('path').remove();

            //bar
            if(this._options.type === "bar"){
                this._renderBar();
            }else {
                this._renderLine();
            }
        },
        _axis: function (scale) {
            return d3.svg.axis().scale(scale);
        },
        _renderAxis: function (axis, transform) {
            this.svg.append("g")
                .attr("transform", transform)
                .style("font-size","10px")
                .call(axis);
        },
        _renderAxisWidthScale:function () {
            //get axis
            var format = d3.time.format("%x"),
                _data=this._data,
                formatX = _data.x.map(function (x) {
                    return format(x);
                }),
                xAxis = this._axis(this.xScale).tickValues(_data.x),
                yAxis = this._axis(this.yScale).orient("left");

            //config axis
            this._renderAxis(xAxis,this._options.transform);
            this._renderAxis(yAxis,"translate(40,80)");
        },
        _xScale: function (domain) {
            var width = this.svg.attr("width").replace("px","");
            /*return d3.scale.linear()
                .domain(domain)
                .range([0, Number.parseInt(width,10) - 50]);*/
            return d3.time.scale()
                .domain(domain)
                .range([0, Number.parseInt(width,10) - 50]);
        },
        _yScale: function (domain) {
            var height = this.svg.attr("height").replace("px","");
            return d3.scale.linear()
                .domain(domain)
                .range([Number.parseInt(height,10) - 100, 0]);//30
        },
        _renderLine: function () {
            var _data = this._data,
                self = this;
            //get scale
            this.xScale = this._xScale([_data.x[0],_data.x[_data.x.length-1]]);//_data.x[0]
            this.yScale = this._yScale((function () {
                var ydata = _data.y,
                    domain = [0, ydata[0][0]];//ydata[0][0]
                ydata.forEach(function (outer) {
                    outer.forEach(function (inner) {
                        /*if(domain[0]>inner){
                         domain[0] = inner;
                         }*/
                        if(domain[1] < inner){
                            domain[1] = inner;
                        }
                    });
                });
                return domain
            }()));
            this._renderAxisWidthScale();

            //design data
            var dataset=[];
            _data.y.forEach(function (item, i) {
                item.forEach(function (ite, j) {
                    if(!dataset[j]){
                        dataset[j] = [];
                    }
                    var subset = dataset[j];
                    subset.push([_data.x[i], ite]);
                });
            });

            if(_data.x.length > 1){

                dataset.forEach(function (data,i) {
                    var line = d3.svg.line()
                        .x(function(d){return self.xScale(d[0]);})
                        .y(function(d){return self.yScale(d[1]);}),

                    //enter
                        selection = self.svg.selectAll("path.line"+i)
                            .data([data])
                            .enter()
                            .append("path");
                    selection
                        .attr("transform", "translate(40,80)")
                        .attr("class", "line"+i)
                        .attr("d", function(d){return line(d);})
                        .style({
                            "fill":'none',
                            "stroke": self._options.chartColor(i),
                            'stroke-width':2
                        });
                    // console.log(_data.y);
                    // console.log(self._options.chartColor(i));
                });
            }

            this._renderDots(dataset);

        },
        
        _renderBar: function () {
            //pile data
            var dataset = [],
                self = this,
                _data = this._data;
            _data.y.forEach(function (item, i) {
                item.forEach(function (ite, j) {
                    if(!dataset[j]){
                        dataset[j] = [];
                    }
                    var subset = dataset[j];
                    subset.push({x:_data.x[i], y:ite});
                });
            });
            d3.layout.stack()(dataset);

            var maxHeight=d3.max(dataset, function(d) {
                return d3.max(d, function(d) { return d.y0 + d.y; });
            }),
                valScale = self._yScale([maxHeight,0]);
            //get scale
            this.xScale = self._xScale([_data.x[0],_data.x[_data.x.length-1]]);//_data.x[0]
            this.yScale = self._yScale([0, maxHeight]);
            self._renderAxisWidthScale();

            var selection = self.svg.selectAll("g.bar").data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", "bar")
                    .attr("transform", "translate(35,0)")
                    .style("fill", function(d, i) { return self._options.chartColor(i); })
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .enter()
                    .append("rect")
                    .attr({
                        x : function(d) {
                            return self.xScale(d.x);
                        },
                        y : function(d) {
                            return self._axisBasline;
                        },
                        height : 0,
                        width : 10
                    });

            // update
            selection
                .transition().duration(this._options.duration)
                .attr({
                    x : function(d) {
                        return self.xScale(d.x);
                    },
                    y : function(d) {
                        return self._axisBasline - valScale(d.y0)-valScale(d.y);
                    },
                    height : function(d) {
                        return valScale(d.y);
                    },
                    width : 10
                });
            // exit
            self.svg.selectAll("g.bar").data(dataset).exit()
                .transition().duration(this._options.duration)
                .style("left", "-100px")
                .remove();

        },
        _renderDots: function (data) {
            var self = this,
                g =  self.svg.append("g")
                    .attr("transform", "translate(40,80)");
            data.forEach(function(list,i){
                list.forEach(function (p) {
                    g.append("circle")
                        .attr("cx", self.xScale(p[0]))
                        .attr("cy", self.yScale(p[1]))
                        .attr("r", 4.5)
                        .style("fill",'#fff')
                        .style("stroke",self._options.markerColor(i));
                });
            });
        }
    });
}($,d3));




