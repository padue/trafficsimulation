var c = ""; /*JSON.parse(
'{"Trafficcounter":['+
    '{"Name":"Nauenstrasse 73",'+
    '"Number":420,'+
    '"Direction":['+
        '{"Successor":4, "Predecessor":1, "Hourly":[210,140,100,110,140,240,650,1050,1110,1050,1040,1080,1040,1210,1190,1150,1230,1310,1240,990,690,520,500,340],"Daily":[17750,18650,18870,19130,19790,16700,13200],"Monthly":[18310,18250,18330,18220,18860,18370,16700,17820,18670,18310,19590,18450]},'+
        '{"Successor":1, "Predecessor":4,"Hourly":[270,170,110,100,130,250,660,1000,900,840,950,1110,1100,1140,1180,1270,1530,1610,1350,930,670,590,550,420],"Daily":[18730,19670,19940,20160,20350,16180,12660],"Monthly":[17850,18980,19000,18850,19430,18750,17010,18220,19390,18840,20470,19050]}],'+
    '"Lon":7.59455680847,'+
    '"Lat":47.546654343777},'+
        
    '{"Name":"Jakob Burckhardt-Strasse",'+
    '"Number":416,"Direction":['+
        '{"Successor":3, "Predecessor":1,"Hourly":[30,20,20,10,20,20,70,210,240,200,200,210,190,230,220,220,240,250,210,160,110,80,70,50],"Daily":[3410,3650,3650,3630,3780,2670,1880],"Monthly":[3320,3560,3430,3420,3650,3510,3030,3260,3300,3340,3710,3510]}],'+
     '"Lon":7.59959936,"Lat":47.54546666639967},'+
        
        '{"Name":"Grosspeterstrasse 45",'+
    '"Number":415,"Direction":['+
        '{"Successor":2, "Predecessor":1 ,"Hourly":[270,170,110,90,120,250,640,990,940,890,1010,1180,1190,1210,1270,1380,1690,1820,1510,1010,730,620,580,430],"Daily":[20790,21980,22300,22470,22650,17390,13180],"Monthly":[19250,20450,20250,20110,20780,19930,18190,19410,20510,20110,21880,20400]},'+
        '{"Successor":1, "Predecessor":2 ,"Hourly":[150,90,70,80,100,180,510,690,710,710,710,730,720,820,810,780,790,820,810,700,510,400,370,250],"Daily":[12000,12500,12710,12910,13460,12010,9970],"Monthly":[11880,12440,12560,12540,12690,12540,11800,12320,12620,12680,13270,12700]}],'+
    '"Lon":7.602903842926025,"Lat":47.545184226965}],'+
    '"Node":[{"Lat":47.54522767928488,"Lon":7.599266767501831,"ID":1},{"Lat":47.54427171992973,"Lon":7.606465816497803,"ID":2},{"Lat":47.54659640891961,"Lon":7.600736618041992,"ID":3},{"Lat":47.54783475255443,"Lon":7.59280800819397,"ID":4}]'+
'}');*/

var linkList = [];
var nodeList = [];
var simulation = null;
var kind = "hourly";
var link = null;

function Numsort(a,b){
    return a-b;
}

function Counter(lon, lat, name, number) {
    this.lon = lon;
    this.lat = lat;
    this.name = name;
    this.number = number;
}

function Direction(monthly, daily, hourly, name) {
    this.monthly = monthly;
    this.daily = daily;
    this.hourly = hourly;
    this.name = name;
    this.minmax = function(data){
        var a = null;
        var mm;
        switch(data){
            case "monthly":
                a = this.monthly;
                break;
            case "hourly":
                a = this.hourly;
                break;
            case "daily":
                a = this.daily;
                break;
            default:
                a = this.hourly;
                break;
        }
        a = JSON.parse(JSON.stringify(a));
        mm = a.sort(Numsort);
        return [mm[0],mm[mm.length-1]];
    };
    
    this.getData = function(data){
        switch(data){
            case "monthly":
                return this.monthly;
            case "hourly":
                return this.hourly;
            case "daily":
                return this.daily;
            default:
                return this.hourly;
        }
    };
    
    this.successor = null;
    this.predecessor = null;
}

function Link(data) {
    this.counter = new Counter(data.Lon, data.Lat, data.Name, data.Number);
    this.direction = data.Direction;

    this.initDirection = function() {
        var dir = JSON.parse(JSON.stringify(this.direction));
        this.direction = [];
        for (var i = 0; i < dir.length; i++) {
            var tmp = new Direction(dir[i].Monthly, dir[i].Daily, dir[i].Hourly, dir[i].Name);
            for (var k = 0; k < nodeList.length; k++) {
                if(dir[i].Successor == nodeList[k].getState().getId()){
                    tmp.successor = nodeList[k];
                } else if(dir[i].Predecessor == nodeList[k].getState().getId()){
                    tmp.predecessor = nodeList[k];
                }
            }
            this.direction.push(tmp);
        }
    };
}

function Simulation(data) {
    this.data = data;
    this.calculateDifferences = function(traffic) {
        for(var i=0;i<linkList.length;i++){
            for(var k=0;k<linkList[i].direction.length;k++){
                var weight;
                switch(traffic){
                    case "daily":
                        weight = linkList[i].direction[k].daily;
                        break;
                    case "hourly":
                        weight = linkList[i].direction[k].hourly;
                        break;
                    case "monthly":
                        weight = linkList[i].direction[k].monthly;
                        break;
                    default:
                        weight = [];
                }
                linkList[i].direction[k].predecessor.getState().calcDifference(weight, "start");
                linkList[i].direction[k].successor.getState().calcDifference(weight, "end");
            }
        }
    };

    this.createGraph = function(data) {
        for (var i = 0; i < data.Trafficcounter.length; i++) {
            linkList.push(new Link(data.Trafficcounter[i]));
        }

        for (var i = 0; i < data.Node.length; i++) {
            nodeList.push(new Node(new State(data.Node[i].Lon, data.Node[i].Lat, data.Node[i].ID)));
        }

        for (var i = 0; i < linkList.length; i++) {
            linkList[i].initDirection();
        }
    };
    
    this.createGraph(this.data);
    this.calculateDifferences("hourly");
}