var map,conent,selectMarker,grouplayers=[];
var atrcount='<div class="esri-feature__fields esri-feature__content-element">'
    +'<table class="esri-widget__table">'
	   +'<tbody>%s</tbody></table></div>';
initMap();
inEvent();

  const googleSWLayer = new AMap.TileLayer({
        getTileUrl: function(x, y, z) {
                z = "L" + z.toString(10).padStart(2,'0');
                x = "C" + x.toString(16).padStart(8,'0');
                y = "R" + y.toString(16).padStart(8,'0');
                return 'severapi/Layers/_alllayers/' + z + '/' + y + '/' + x + '.png';
        },
        zIndex: 100
})
googleSWLayer.setMap(this.map);

//初始化地图
function initMap(){
	map = new AMap.Map('container', {
            zoom: 6.5,
            zooms:[6,20],
         center: [108.94703112653409,35.25946520963723],
              defaultCursor:"auto",
              showIndoorMap:false,
              expandZoomRange:true
	});

	AMapUI.loadUI(['control/BasicControl'], function(BasicControl) {  
	    map.addControl(new BasicControl.LayerSwitcher({}));
	}); 

	//定位
	map.plugin('AMap.Geolocation', function () {
		geolocation = new AMap.Geolocation({
		    enableHighAccuracy: true, // 是否使用高精度定位，默认:true
		    noIpLocate:3,  // 是否禁止使用IP定位,默认值为0,可选值 0~3; 0可以使用IP定位,1手机设备禁止使用IP定位,2PC上禁止使用IP定位,3所有设备禁止使用IP定位
		   noGeoLocation:0,
		   timeout: 10000,           // 超过10秒后停止定位，默认：无穷大
		    maximumAge: 0,            // 定位结果缓存0毫秒，默认：0
		    convert: true,            // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
		    showButton: true,         // 显示定位按钮，默认：true
		    buttonPosition: 'LB',     // 定位按钮停靠位置，默认：'LB'，左下角
		    buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
		    showMarker: true,         // 定位成功后在定位到的位置显示点标记，默认：true
		    showCircle: true,         // 定位成功后用圆圈表示定位精度范围，默认：true
		    panToLocation: true,      // 定位成功后将定位到的位置作为地图中心点，默认：true
		    zoomToAccuracy:true       // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
		 
	    });
	    map.addControl(geolocation);
	      // 获取当前位置信息
        geolocation.getCurrentPosition();
        // 监听获取位置信息成功的回调函数
        AMap.event.addListener(geolocation, 'complete', function(res){
        	
        });
        // 监听获取位置信息错误的回调函数
        AMap.event.addListener(geolocation, 'error', function(d){});

	    
	});
};
//$.getJSON("../config/attributeConfig.json", function (data){
//	conent=data;
//});
function inEvent(){
	$("#dtqh").click(function(e){//显示图层切换模块
		if($("#mapSwitch")[0].src==""){
			$("#mapSwitch")[0].src="page/mapswitch.html"
		}
		$("#rightIfram").show();
	});
	map.on('click', function(e) {//地图点击事件
		$(".amap-info0").empty();
		$(".amap-geo").show();
		if(selectMarker!=null){
			map.remove(selectMarker);
			selectMarker=null;
		}
		if($("#rightIfram").is(":visible")){
			$("#rightIfram").hide();
		}

	});
	window.addEventListener('message', receiveMessage, false);//图层切换监听
}
//底图及图层切换数据接收
function receiveMessage(e){
	var data=e.data;
	if(data.type&&data.type=="basemap"){//底图切换
		$(".amap-ui-control-layer-selector")[data.id].click();
	}else if(data.type&&data.type=="layer"){//图层切换
		var layer=null;
		grouplayers.forEach(item=>{
			if(item.id!=="city1"){
				if(item.id===data.id){
					layer=item.layer;
					if(!item.visable){
						map.add(item.layer)
						item.visable=true;
					}
				}else{
					map.remove(item.layer)
					item.visable=false
				}		
			}
		})
		if(!layer){
			addLayer(data.id)
		}
	}else if(data.type&&data.type=="clear"){
		grouplayers.forEach(item=>{
			if(item.id!=="city1"&&item.visable){
				map.remove(item.layer)
				item.visable=false		
			}
		})
	}
};

//getData("severapi/rest/api/search?layerName=sx_citygh&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
//	var markers=[];
//	list.forEach(item => {
//	
//		// var paths=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type);
//			// paths.forEach(path => {
//			// 	var polyline =createDraw(path,"line",{strokeColor: "#37f707"},markers);
//			// 	item.attributes.id="sx_whpyslx";
//			// 	polyline.setExtData(item.attributes);
//				
//			// })
//			var geom=JSON.parse(item.geoJson)
//			  var paths=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type);
//				var polygon= createDraw(paths,"poygon",{fillColor:"#53f3f3",strokeColor:'red'},markers)
//				polygon.setExtData(item.attributes);	
//		  
//	  })
// 
//	  grouplayers.push({id:"city1",layer:markers,visable:true});
//});
function addLayer(key){
	switch (key) {
		case "sx_fxy":
			addfxyLayer()
			break;
		case "sx_zdqy":
			addszqyLayer()
			break;
		case "sx_gyyq":
			addgyyqLayer()
			break;	
		case "sx_wk":
			addwkLayer()
			break;
		case "sx_whpyslx":
			addwhpyslxLayer()
			break;
	}
}
function addfxyLayer(){
	getData("severapi/rest/api/search?layerName=sx_fxy&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
		var markers=[];
		list.forEach(item => {
			var geom=JSON.parse(item.geoJson)
			if(geom.type==="Point"){
				var point=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type);
				var marker= createDraw(point,"point",{fillColor:"red",strokeColor:'white'},markers)
				item.attributes.id="sx_fxy"
				marker.setExtData(item.attributes);
			}
		})
		grouplayers.push({id:"sx_fxy",layer:markers,visable:true});
	});
}
function addgyyqLayer(){
	getData("severapi/rest/api/search?layerName=sx_gyyq&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
		var markers=[];
		list.forEach(item => {
			var geom=JSON.parse(item.geoJson)
			if(geom.type==="Point"){
				var point=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type)
				var marker= createDraw(point,"point",{fillColor:"yellow",strokeColor:'white'},markers)
				item.attributes.id="sx_gyyq";
				marker.setExtData(item.attributes);
			}
		})
		grouplayers.push({id:"sx_gyyq",layer:markers,visable:true});
	});
}
function addwkLayer(){
	getData("severapi/rest/api/search?layerName=sx_wk&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
		var markers=[];
		list.forEach(item => {
			var geom=JSON.parse(item.geoJson)
			if(geom.type==="Point"){
				var point=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type)
				var marker= createDraw(point,"point",{fillColor:"green",strokeColor:'white'},markers);
				item.attributes.id="sx_wk";
				marker.setExtData(item.attributes) 
			
			}
		})
		grouplayers.push({id:"sx_wk",layer:markers,visable:true});
	});
}
function addszqyLayer(){
	getData("severapi/rest/api/search?layerName=sx_szqy&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
		var markers=[];
		list.forEach(item => {
			var geom=JSON.parse(item.geoJson)
			if(geom.type==="Point"){
				var point=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type);
				var marker= createDraw(point,"point",{fillColor:"gray",strokeColor:'white'},markers);
				item.attributes.id="sx_szqy";
				marker.setExtData(item.attributes)  
			}
		})
		grouplayers.push({id:"sx_szqy",layer:markers,visable:true});
	});
}
function addwhpyslxLayer(){
	getData("severapi/rest/api/search?layerName=sx_whpyslx&isReturnGeometry=true&spatialRel=INTERSECTS",function(list){
		var markers=[];
		list.forEach(item => {
			var geom=JSON.parse(item.geoJson)
			if(geom.type==="MultiLineString"){
				var paths=coordinateTransform.wgs84ToGd(geom.coordinates,geom.type);
				paths.forEach(path => {
					var polyline =createDraw(path,"line",{strokeColor: "#37f707"},markers);
					item.attributes.id="sx_whpyslx";
					polyline.setExtData(item.attributes);
					
				})
				
			}
		})
		grouplayers.push({id:"sx_whpyslx",layer:markers,visable:true});
	});
}
function getData(url,success){
	$.ajax({
		type: "get",
		async: false,
		url: url,
		crossDomain:true,
		success:function(result) {
			if(result.data.features.length>0){
				success(result.data.features);
			}
				
		}
});
}
function createDraw(coors,type,param,layer){
	var draw=null;
	switch (type) {
		case "point":
			draw =new AMap.CircleMarker({
				map:map,
				center:coors,
				radius:8,//3D视图下，CircleMarker半径不要超过64px
				strokeColor:param.strokeColor?param.strokeColor:'white',
				strokeWeight:2,
				strokeOpacity:1,
				fillOpacity:1,
				fillColor:param.fillColor?param.fillColor:"yellow",
				zIndex:5
			  });
			//    new AMap.Marker({
			// 	position: coors,
			// 	icon: '',
			// 	map:map
			//    });
			break;
		case "line":
			 draw = new AMap.Polyline({
				map:map,
				path: coors,  
				strokeWeight:3,
				strokeOpacity:1, 
				borderWeight: 1, // 线条宽度，默认为 1
				strokeColor: param.strokeColor?param.strokeColor:"#37f707", // 线条颜色
				lineJoin: 'round', // 折线拐点连接处样式
				zIndex:5
			});   
			
			break;
		case "poygon":
			draw = new AMap.Polygon({
				map:map,
			   path: coors,  
			   fillColor: param.fillColor?param.fillColor:'#53f3f3', // 多边形填充颜色
			   fillOpacity:0.5,
			   borderWeight: 2, // 线条宽度，默认为 1
			   strokeColor: param.strokeColor?param.strokeColor:'red', // 线条颜色
			   zIndex:2
		   });
			break;

	}
	if(type==="point"){
		draw.on("click",function(e){
			var data=e.target.getExtData();
			var postion=postion=e.target.getCenter();
			if(data.id){
				showPoup(data,postion)
			}	
		});
	}
	
	layer.push(draw)
	return draw;
}

//属性弹窗
function showPoup(data,point){	
	var atrs= conent[data.id];
	$(".amap-info0").empty();
	$(".amap-info0").append(getAttrInfoContentByData(atrs,data));
	$(".amap-geo").hide();
	$('.amap-info-close').click(function(e){
		$(".amap-info0").empty();
		$(".amap-geo").show();
		if(selectMarker!=null){
			map.remove(selectMarker);
			selectMarker=null;
		}
	});
	$(".amap-info0").css("bottom","10px");
	if(selectMarker!=null){
		map.remove(selectMarker);
		selectMarker=null;
	}
	selectMarker = new AMap.CircleMarker({
	  map:map,
      center:point,
      radius:8,//3D视图下，CircleMarker半径不要超过64px
      strokeColor:'#22dddd',
      strokeWeight:2,
      strokeOpacity:1,
  	  fillOpacity:0,
  	   zIndex:999
    });

    
};
//属性弹窗内容组装
function getAttrInfoContentByData(item, data){
	var itemsHTML="";
	var head ='<div class="amap-info-shadowContainer" style="position: absolute;"></div>'+
	'<div class="amap-info-contentContainer">'+
	'<div class="amap-info-content amap-info-outer">'+
	'<div class="esri-popup__header-container"  >'+'<h2 class="esri-popup__header-title"';
	head+='>'+checkValue(data.titleField)+'</h2></div>';
	var temp = head+atrcount+'<a class="amap-info-close">×</a></div></div>';
	if(item){
		item.fileds.forEach(fieldItem => {
			itemsHTML += ('<tr><th class="esri-feature__field-header">'+fieldItem.alias+'</th><td class="esri-feature__field-data">'+checkValue(data[fieldItem.field])+'</td></tr>');
		}); 
	}
	return temp.replace('%s', itemsHTML);
};
//弹窗字段空值检测
function checkValue(value){
    return typeof value === 'undefined'?"":value == null?"":value;
};



   

