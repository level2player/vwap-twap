/*
	VWAP TWAP Demo
*/


// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

initView();

function initView()
{
    $('#btn_vwap').click(function(){
        $('#btn_vwap').toggleClass("btn loading");
        $.ajax({
            url:'http://www.zenyu.site/data/webapihktradett',
            type:'GET',
            dataType:"json",
            data:{stock_code: "1",action_in:0} , //1号股票
            success :function(data,status,xhr){
                loadData(data['stock_code'],data['trade_Log']);
                $('#btn_vwap').toggleClass("btn loading");
            },
            error :function(xhr, error, exception){
                $('#btn_vwap').toggleClass("btn");
                alert(error);
            }
        });
    });
}
//取一断时间内minute间隔Arry
function getMinutesArry(startime,endtime,minute){
    var secondArry = new Array();
    for(var i=Date.parse(startime);i<=Date.parse(endtime);i+=60000*minute)
    {
        var time2 = new Date(i).Format("hhmm");
        secondArry.push(time2)
    }
    return secondArry;
}

function loadData()
{
    //兼容IE、谷歌
    var secondArry= getMinutesArry('2013/01/03 13:00','2013/01/03 16:00',5)
    var logArry=new Array();
    Enumerable.From(arguments[1]).ForEach(function(value,index){
        var tmp_time=value.trade_time.substring(0,4);
        logArry.push({time:tmp_time,price:value.price,volum:value.aggr_qty});
    });
    var vwapChartArry=new Array();
    var twapChartArry=new Array();
    for(i=0;i<secondArry.length;i++)
    {   
        if (i==0)
        {
            var arrRes = Enumerable.From(logArry).Where(function(x){return x.time<secondArry[i]}).ToArray();
        }
        else if ((i+1)==secondArry.length)
        {
            var arrRes = Enumerable.From(logArry).Where(function(x){return x.time>=secondArry[i]}).ToArray();
        }
        else
        {
            var arrRes = Enumerable.From(logArry).Where(function(x){return x.time>=secondArry[i] && x.time<secondArry[i+1]}).ToArray();
        }
        if(arrRes.length>0)
        {
            var total_sum=0;
            var total_sum_volum=0;
            var total_price_sum=0;
            Enumerable.From(arrRes).ForEach(function(value,index){
                total_sum+=value.price*value.volum;
                total_sum_volum+=value.volum;
                total_price_sum+=value.price;
            });
            var vwapValue=(total_sum/total_sum_volum).toFixed(4);
            var twapValue=(total_price_sum/arrRes.length).toFixed(4);
            vwapChartArry.push(vwapValue);
            twapChartArry.push(twapValue);
        }
    }
    loadChart(secondArry,vwapChartArry,twapChartArry);
}

function loadChart()
{
    console.log(arguments[0].length);
    console.log(arguments[1].length);
    console.log(arguments[2].length);
    var ctx = document.getElementById("chart_vwap").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels : arguments[0],
            datasets : [
                {
                    label:"VWAP",
                    fillColor : "rgba(1,220,220,0.5)",
                    strokeColor : "rgba(1,220,220,1)",
                    pointColor : "rgba(220,220,220,1)",
                    pointStrokeColor : "#fff",
                    data : arguments[1]
                },
                {
                    label:"TWAP",
                    fillColor : "rgba(151,187,205,0.5)",
                    strokeColor : "rgba(151,187,205,1)",
                    pointColor : "rgba(151,187,205,1)",
                    pointStrokeColor : "#fff",
                    data : arguments[2]
                }
            ]
        },
        options: {        
            animation: {
                duration: 0, // general animation time
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
        }
    
    });
}



