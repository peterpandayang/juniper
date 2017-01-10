;(function ($) {
    $(function () {
        $("#setting").click(function () {
            $("#userPanel").show();
        });
        $("#img_close").click(function () {
            $("#userPanel").hide();
        });
    });
    $("#submit").click(function () {
        var userdata={
            form:new Date(),
            to:new Date(),
            data:{
                cpu_usage:$("#cpu_usage").val(),
                errors:{
                    component:$("#errors_component").val(),
                    sensor:$("#errors_sensor").val(),
                    system:$("#errors_system").val()
                },
                memory_available:$("#memory_available").val(),
                memory_usage:$("#memory_usage").val(),
                network_packet:{
                    in:$("#network_packet_in").val(),
                    out:$("#network_packet_out").val()
                },
                network_throughput:{
                    in:$("#network_throughput_in").val(),
                    out:$("#network_throughput_out").val()
                }
            }
        };
        $.ajax({
            type:"post",
            url:"/server_stat",
            data:userdata
        });
    });
}($));
