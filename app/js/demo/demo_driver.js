(function () {
    function DataFetcher(serverID, delay) {
        var self = this;

        self.delay = delay;
        self.serverID = serverID;
        self.timer = null;
        self.requestObj = null;

        function getNext() {
            var startTime = new Date(),
                endTime = new Date(startTime.getTime() + 1000),
                queryParam = ["from=", startTime.getTime(), "&to=", endTime.getTime()].join("");

            self.requestObj = $.ajax({
                    url: ["/server_stat/", self.serverID, "?" + queryParam].join("")
                }).done(function(response) {
                    $(document).trigger("stateFetchingSuccess", {
                        from: startTime,
                        to: endTime,
                        result: response
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    $(document).trigger("stateFetchingFailure", {
                        from: startTime,
                        to: endTime,
                        error: textStatus
                    });
                }).always(function() {
                    self.timer = setTimeout(getNext, self.delay);
                });
        }

        self.start = function() {
            getNext();
        };

        self.setDelay = function(newDelay) {
            this.delay = newDelay;
        };

        self.setServerID = function(newServerID) {
            this.serverID = newServerID;
        };
    }

    function addNewEntry(contentHTML) {
        var newEntry = $("<li/>").text(contentHTML);

        if (++counter > limit) {
            $responseList.find("li").first().remove();
        }

        $responseList.append(newEntry);
    }
    var $responseList = $("#mockAPIResponse"),
        counter = 0,
        limit = 10;

    $(document).on({
        "stateFetchingSuccess": function(event, response) {
            //{x:2,y:[0,300,600]}
            //cpu_usage,errors_component,errors_sensor,errors_system,memory_available,memory_usage,network_packet_in,network_packet_out,network_throughput_in,network_throughput_out
            var data={
                x:new Date(response.to),
                y:[0,0,0,0,0,0,0,0,0]
            };
            response.result.data.forEach(function (rData) {
                data.y[0] += rData.errors.component;
                data.y[1] += rData.errors.sensor;
                data.y[2] += rData.errors.system;
                data.y[3] += rData.memory_available;
                data.y[4] += rData.memory_usage;
                data.y[5] += rData.network_packet.in;
                data.y[6] += rData.network_packet.out;
                data.y[7] += rData.network_throughput.in;
                data.y[8] += rData.network_throughput.out;
            });
            instance.render(data);
            /*data.result.data.forEach(function(dataEntry) {
                //addNewEntry(JSON.stringify(dataEntry));
            });*/
        },
        "stateFetchingFailure": function(event, data) {
            //addNewEntry(JSON.stringify(data.error));
        }
    });

    var df = new DataFetcher("server1", 1000),
        config = {
            title:"D3 Chart Test",
            titleOffset:[450,40],
            titleStyle:{
                "text-anchor":'middle',
                "font-size":40,
                "stroke":'red',
                "fill":'aqua'
            },
            type:"bar",
            markerColor:d3.scale.category20c(),//d3.scale.category20c
            chartColor:d3.scale.category20c(),//d3.scale.category20c
            duration:500,
            nodeNum:20
        },
        instance = new DMGJ.D3Chart.chart("chart",config);

    df.start();
})();