function Controller(){
    this.index = 0;
    marker = null;
    
    setUp = function(kind){
        this.index = 0;
        document.getElementById("slider").value = "0";
        switch(kind){
            case "hourly":
                document.getElementById("maptitle").innerText = "0:00";
                document.getElementById("slider").max="23";
                break;
            case "daily":
                document.getElementById("maptitle").innerText = "Montag";
                document.getElementById("slider").max="6";
                document.getElementById("slider").value = "0";
                break;
            case "monthly":
                document.getElementById("maptitle").innerText = "Januar";
                document.getElementById("slider").max="11";
                break;
        }
        animateSimulation(0);
        var latlng = {}; latlng.lat = link.counter.lat; latlng.lng = link.counter.lon;
        markerClick(latlng);
    };
    
    document.getElementById("hourly").onclick = function(){
        kind = "hourly";
        simulation.calculateDifferences(kind);
        setUp(kind);
    };
    document.getElementById("daily").onclick = function(){
        kind = "daily";
        simulation.calculateDifferences(kind);
        setUp(kind);
    };
    document.getElementById("monthly").onclick = function(){
        kind = "monthly";
        simulation.calculateDifferences(kind);
        setUp(kind);
    };
    
    animateSimulation = function(i){
        tm.changeArrow(i);
        tm.addNode(i);
        setTitle(i);
    };
    
    setTitle = function(i){
        var t = "";
        switch(kind){
            case "monthly":
                t = months[i];
                break;
            case "daily":
                t = days[i];
                break;
            case "hourly":
                t = hours[i];
                break;
            default:
                t = hours[i];
                break;  
        }
        document.getElementById("maptitle").innerText = t;
    };
    
    document.getElementById("slider").onchange = function(){
        animateSimulation(parseInt(document.getElementById("slider").value));
    };
    
    markerClick = function(latlng){
        var latlon = this.changeChart(latlng);
        this.markCounter(latlon);
    };
    
    markCounter = function(latlng){
        if(marker != null){
            map.removeLayer(marker);
        }
        marker = L.marker(latlng).addTo(map);
    };
    
    changeChart = function(latlng){
        for(var i=0;i<linkList.length;i++){
            if(Math.round(1000*linkList[i].counter.lat) == Math.round(1000*latlng.lat) && Math.round(1000*linkList[i].counter.lon) == Math.round(1000*latlng.lng)){
                link = linkList[i];
            }
        }
        document.getElementById("name").innerText = link.counter.name;
        document.getElementById("number").innerText = link.counter.number;
        document.getElementById("direction1").innerText = "";
        document.getElementById("direction2").innerText = "";
        var datasets = [
                {
                    fillColor : "rgba(050,205,050,0.5)",
                    strokeColor : "rgba(050,205,050,1)",
                    data : []
                },
                {
                    fillColor : "rgba(255,020,147,0.5)",
                    strokeColor : "rgba(255,020,147,1)",
                    data : []
                }
            ];
        var chartData = {
            labels : [],
            datasets : []
        };
        switch(kind){
            case "monthly":
                chartData.labels = months;
                break
            case "daily":
                chartData.labels = days;
                break;
            case "hourly":
                chartData.labels = hours;
                break;
        }
        for(var i=0;i<link.direction.length;i++){
            document.getElementById("direction"+(i+1)).innerText = link.direction[i].name;
            var data = datasets[i];
            switch(kind){
                case "monthly":
                    data.data = link.direction[i].monthly;
                    break
                case "daily":
                    data.data = link.direction[i].daily;
                    break;
                case "hourly":
                    data.data = link.direction[i].hourly;
                    break;
            }
            chartData.datasets.push(data);
        }
        new Chart(document.getElementById("canvas").getContext("2d")).Bar(chartData);
        return [link.counter.lat,link.counter.lon];
    };
}

var hours = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

main = function(){
    simulation = new Simulation(c);
    controller = new Controller();
    tm = new TrafficMap(7.599095, 47.54527, 11);
    tm.createEdge(linkList);
    tm.createCounter(linkList);
    link = linkList[0];
    setUp("hourly");
};

window.onload = function(){
    $("#simulation").hide();
    $("#dialog").dialog("open");
};