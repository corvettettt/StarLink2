import React, {Component} from 'react';
import {WORLD_MAP_URL} from '../constants';
import axios from 'axios';
import {feature} from "topojson-client";
import { geoKavrayskiy7 } from 'd3-geo-projection';
import {select as d3select} from "d3-selection";
import {geoPath,geoGraticule} from "d3-geo";


const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.refMap = React.createRef();
    }

    componentDidMount(){
        //拿到地图数据
        axios.get(WORLD_MAP_URL)
            .then(res=>{
                const {data} = res;
                //拿到地图中的country的数据
                const land = feature(data,data.objects.countries).features;
                this.generateMap(land)
            })
            .catch(err=>{
                console.log(err);
            })
    }

    generateMap = land=>{
        // create projection
        // 地图投影的样式
        // 给长宽和精度
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width/2,height/2])
            .precision(0.1);

        // 找到画布
        const canvas = d3select(this.refMap.current)
            .attr('width', width)
            .attr('height',height);

        // 准备经纬线
        const graticule = geoGraticule();

        console.log(graticule);

        // 将画布准备为2D
        let context = canvas.node().getContext('2d');

        // 画笔
        let path = geoPath().projection(projection).context(context);

    //    data <--> Map

        land.forEach(ele=>{
            // 填充颜色
            context.fillStyle = '#B3DDEF';
            // 画笔颜色，边界颜色
            context.strokeStyle = '#000';
            // 清晰度
            context.globalAlpha = 0.7;
            context.beginPath();
            // 画笔的位置
            path(ele);
            context.fill();
            context.stroke();

            // 画经纬度
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();
            // 地图边界
            context.beginPath();
            path(graticule.outline());
            context.lineWidth = 0.5;
            context.stroke();
        });

        // context.fillStyle = '#B3DDEF';
        // // 画笔颜色，边界颜色
        // context.strokeStyle = '#000';
        // // 清晰度
        // context.globalAlpha = 0.7;
        // context.beginPath();
        // // 画笔的位置
        // path(land[22]);
        // context.fill();
        // context.stroke();
        // // 画经纬度
        // context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
        // context.beginPath();
        // path(graticule());
        // context.lineWidth = 0.1;
        // context.stroke();
        // // 地图边界
        // context.beginPath();
        // path(graticule.outline());
        // context.lineWidth = 0.5;
        // context.stroke();
    }

    render() {
        return (
            <div >
                <canvas ref = {this.refMap} />
            </div>
        );
    }
}

export default WorldMap;