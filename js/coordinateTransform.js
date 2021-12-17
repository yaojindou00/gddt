( function( global, factory ) {
	"use strict";
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	var coordinateTransform={};
	//定义一些常量
	var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
	var PI = 3.1415926535897932384626;
	var a = 6378245.0;
	var ee = 0.00669342162296594323;
	 
	/**
	 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
	 * 即 百度 转 谷歌、高德
	 * @param bd_lon
	 * @param bd_lat
	 * @returns {*[]}
	 */
	function bd09togcj02(bd_lon, bd_lat) {
		var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
		var x = bd_lon - 0.0065;
		var y = bd_lat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		var gg_lng = z * Math.cos(theta);
		var gg_lat = z * Math.sin(theta);
		return [gg_lng, gg_lat]
	}
	 
	/**
	 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
	 * 即谷歌、高德 转 百度
	 * @param lng
	 * @param lat
	 * @returns {*[]}
	 */
	function gcj02tobd09(lng, lat) {
		var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
		var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
		var bd_lng = z * Math.cos(theta) + 0.0065;
		var bd_lat = z * Math.sin(theta) + 0.006;
		return [bd_lng, bd_lat]
	}
	
	//投影转地理
	 function mercatorTolonlat(x0,y0){
	    var lonlat={x:0,y:0};
	    var x = x0/20037508.342789*180;
	    var y = y0/20037508.342789*180;
	    y= 180/PI*(2*Math.atan(Math.exp(y*PI/180))-PI/2);
	    lonlat.x = x;
	    lonlat.y = y;
	    return lonlat;
	}
	 
	 function lonLatToMercator(x0,y0){
		var lonlat={x:0,y:0};
		var  x =  x0 * 20037508.342789 / 180;
		var  y =  (Math.log(Math.tan((90 + y0) * PI / 360)) / (PI / 180));
		y =  y * 20037508.342789 / 180;
		lonlat.x = x;
	    lonlat.y = y;
	    return lonlat;
	}
	/**
	 * WGS84转GCj02
	 * @param lng
	 * @param lat
	 * @returns {*[]}
	 */
	function wgs84togcj02(lng, lat) {
		if (out_of_china(lng, lat)) {
			return [lng, lat]
		}
		else {
			var dlat = transformlat(lng - 105.0, lat - 35.0);
			var dlng = transformlng(lng - 105.0, lat - 35.0);
			var radlat = lat / 180.0 * PI;
			var magic = Math.sin(radlat);
			magic = 1 - ee * magic * magic;
			var sqrtmagic = Math.sqrt(magic);
			dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
			dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
			var mglat = lat + dlat;
			var mglng = lng + dlng;
			return [mglng, mglat]
		}
	}
	 
	/**
	 * GCJ02 转换为 WGS84
	 * @param lng
	 * @param lat
	 * @returns {*[]}
	 */
	function gcj02towgs84(lng, lat) {
		if (out_of_china(lng, lat)) {
			return [lng, lat]
		}
		else {
			var dlat = transformlat(lng - 105.0, lat - 35.0);
			var dlng = transformlng(lng - 105.0, lat - 35.0);
			var radlat = lat / 180.0 * PI;
			var magic = Math.sin(radlat);
			magic = 1 - ee * magic * magic;
			var sqrtmagic = Math.sqrt(magic);
			dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
			dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
			mglat = lat + dlat;
			mglng = lng + dlng;
			return [lng * 2 - mglng, lat * 2 - mglat]
		}
	}
	 
	function transformlat(lng, lat) {
		var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
		ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
		return ret
	}
	 
	function transformlng(lng, lat) {
		var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
		ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
		return ret
	}
	 
	/**
	 * 判断是否在国内，不在国内则不做偏移
	 * @param lng
	 * @param lat
	 * @returns {boolean}
	 */
	function out_of_china(lng, lat) {
		return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
	}
//84转高德
	function wgs84ToGd(geo,type) {
		if(type.toLocaleUpperCase()=="POINT"){
			var p=wgs84togcj02(geo[0],geo[1]);
			return [p[0],p[1]];
		}else if(type.toLocaleUpperCase()=="MULTILINESTRING"){
			var path=[];
			geo.forEach(coors => {
				var line=[];
				coors.forEach(item => {
					var p=wgs84togcj02(item[0],item[1]);
					line.push([p[0],p[1]]);
				});
				path.push(line);
			});
			return path;
		}else if(type.toLocaleUpperCase()=="MULTIPOLYGON"){
			var ring=[];
			geo.forEach(coors => {
				var path=[];
				coors.forEach(item => {
					var line=[];
					item.forEach(ite => {
						var p=wgs84togcj02(ite[0],ite[1]);
						line.push([p[0],p[1]])
					});
					path.push(line);
				});
				ring.push(path);
			});
			return ring;
		}
	};
//	高德转84
	function gdToWgs84(geo,type) {
		if(type.toLocaleUpperCase()=="POINT"){
			var p=gcj02towgs84(geo[0],geo[1]);
			return [p[0],p[1]];
		}else if(type.toLocaleUpperCase()=="MULTILINESTRING"){
			var path=[];
			geo.forEach(coors => {
				var line=[];
				coors.forEach(item => {
					var p=gcj02towgs84(item[0],item[1]);
					line.push([p[0],p[1]]);
				});
				path.push(line);
			});
			return path;
		}else if(type.toLocaleUpperCase()=="MULTIPOLYGON"){
			var ring=[];
			geo.forEach(coors => {
				var path=[];
				coors.forEach(item => {
					var line=[];
					item.forEach(ite => {
						var p=gcj02towgs84(ite[0],ite[1]);
						line.push([p[0],p[1]])
					});
					path.push(line);
				});
				ring.push(path);
			});
			return ring;
		}
	};
	coordinateTransform.wgs84ToGd=wgs84ToGd;
	coordinateTransform.gdToWgs84=gdToWgs84;
	window.coordinateTransform=coordinateTransform;
	return coordinateTransform;
});