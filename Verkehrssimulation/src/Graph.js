function Node(state){
	this.state = state;
	
	this.getState = function(){
		return this.state;
	};
	
	this.setState = function(x){
		this.state = x;
	};

	this.addEdge = function(x) {
		this.edge.push(x);
	};
}

function State(lon,lat, id){
	this.lon = lon;
	this.lat = lat;
        this.id = id;
	this.diff = null;
	
	this.setDifference = function(x){
		this.diff = x;
	};
	
	this.getDifference = function(){
		return this.diff;
	};
        
        this.setId = function(x){
		this.id = x;
	};
	
	this.getId = function(){
		return this.id;
	};
	
	this.calcDifference = function(x,y){
            if(this.diff == null || this.diff.length != x.length){
                if(y == "end"){
                    this.diff = x.map(function(x){return 1*x;});
                } else {
                    this.diff = x.map(function(x){
                       return -x; 
                    });
                }
            } else{
                for(var i=0;i<x.length;i++){
                    if(y == "end"){
                        this.diff[i] += x[i];
                    } else {
                        this.diff[i] -= x[i];
                    }
                }
            }
	};
        
        this.minmax = function(){
            var a = JSON.parse(JSON.stringify(this.diff));
            var mm  = a.sort(Numsort);
            return [mm[0],mm[mm.length-1]];
        };
	
	this.setLon = function(x){
		this.lon = x;
	};
	
	this.setLat = function(x){
		this.lat = x;
	};
	
	this.getLon = function(){
		return this.lon;
	};
	
	this.getLat = function(){
		return this.lat;
	};
}