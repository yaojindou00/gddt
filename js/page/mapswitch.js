var vm=null;
initData();
//初始化Vue
function initData(){
	vm= new Vue({
			el:".container",
			data:{
				basemaps:[
					{name:"电子地图",checked:true,icon:"../img/dzdt.png",id:0},
					{name:"影像地图",checked:false,icon:"../img/yxdt.png",id:1}],
				layers:[],
				layerListShow:false,
				container:null,
            	selected:null,
            	selectlayer:null
			},
			methods:{
				  toggleLayerListPanel:function(e){
					this.layerListShow=!this.layerListShow;
				  },
				  basemapClick:function(basemap,e){//底图切换
				  	 
					if(this.basemaps){
						for(let i=0;i<this.basemaps.length;i++){
							let temp = this.basemaps[i];
							if(temp==basemap){
								temp.checked=true;
								 var data={type:"basemap",id:temp.id};
        			  			 top.postMessage(data, location.origin);
								
							}else{
								temp.checked=false;
							}
		
						}
					}
				},
				layerItemClick:function(layer,e){//图层切换
					if(layer.od===2){
						$(e.currentTarget).parent().find('div').css("background","none")
						if(this.layers){
							for(var i=0;i<this.layers.length;i++){
								if(layer.title==this.layers[i].title){
									$(e.currentTarget).css("background","rgba(238,238,238,0.9)")
								}
							}
						}
						
						var data={type:"layer",id:layer.id,name:layer.name};
						this.selectlayer=layer;
						top.postMessage(data, location.origin);
					}
				},
				resetLayerClick:function(){//
					var data={type:"clear"};
        			top.postMessage(data, location.origin);
        			$(".worklist>div").css("background","none")
		        	this.selectlayer=null;
		        	
				}
				  
			}
		});
	 vm.$nextTick(function () {
    	 $(".container").show();
     });
	$.getJSON("../config/layersConfig.json", function (data){
		vm.layers=data.layers;
	});


};
