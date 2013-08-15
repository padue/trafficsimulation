function TrafficMap(lon,lat, zoom){
    map = L.map('map').setView([lat, lon], zoom);
    this.arrows = [];

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    this.heatmapLayer = L.TileLayer.heatMap({
        radius: { value: 100, absolute: true },
        //radius: { value: 30, absolute: false },
	opacity: 0.5,
	gradient: {
		0.20: "rgb(0,0,255)",
		0.40: "rgb(0,255,255)",
		0.60: "rgb(0,255,0)",
		0.80: "yellow",
		1: "rgb(255,0,0)"
	}
    }).addTo(map);
    
    this.addNode = function(index){
        var dataset = {};
        var data = [];
        var m = [];
        for(var i=0;i<nodeList.length;i++){
            m = m.concat(nodeList[i].getState().minmax());
        }
        m = m.map(function(x){return Math.abs(x);});
        m = m.sort(Numsort);
        m = m.reverse();
        dataset.max = m[0];
        
        for(var i=0;i<nodeList.length;i++){
            var tmp = {};
            tmp.lon = nodeList[i].getState().getLon();
            tmp.lat = nodeList[i].getState().getLat();
            tmp.value = Math.abs(nodeList[i].getState().getDifference()[index]);
            data.push(tmp);
        }
        dataset.data = data;
        this.heatmapLayer.setData(dataset);
    };
    
    this.createNode = function(node){
        
    };
    
    this.createEdge = function(link){
        for(var i=0;i<link.length;i++){
            for(var j=0;j<link[i].direction.length;j++){
                var edge = L.polyline([[link[i].counter.lat,link[i].counter.lon],[link[i].direction[j].successor.getState().getLat(),link[i].direction[j].successor.getState().getLon()]], {color: 'blue'}).addTo(map);
                edge.direction = link[i].direction[j];
                var arrowHead = L.polylineDecorator(edge, {
                    patterns: [
                        {offset: '0%', repeat: '0%', symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: '#000000'}})}
                    ]
                }).addTo(map);
                this.arrows.push(arrowHead);
                if(link[i].direction.length==1){
                    var edge = L.polyline([[link[i].direction[j].predecessor.getState().getLat(),link[i].direction[j].predecessor.getState().getLon()],[link[i].counter.lat,link[i].counter.lon]], {color: 'blue'}).addTo(map);
                }
            }
        }
    };
    
    this.changeArrow = function(i){
        var max = [];
        for(var k=0;k<this.arrows.length;k++){
            max.push(this.arrows[k]._polyline.direction.minmax(kind)[1]);
        }
        max = max.sort(Numsort);
        max = max.reverse()[0];
        for(var k=0;k<this.arrows.length;k++){
            var off = 100*this.arrows[k]._polyline.direction.getData(kind)[i]/max+15;
            this.arrows[k].setPatterns([
                {offset: off+'px', repeat: '0%', symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: '#000000', opacity: 1}})}
            ]);
        }
    };
    
    this.createCounter = function(link){
        for(var i=0;i<link.length;i++){
            var marker = L.circleMarker([link[i].counter.lat, link[i].counter.lon],{
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.8
            }).addTo(map);
            marker.id = link[i].counter.number;
            marker.on('click',function(e){
                markerClick(e.latlng);
            });
        }
    };
}