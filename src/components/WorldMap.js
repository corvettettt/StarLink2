import React, {Component} from 'react';
import {WORLD_MAP_URL,SATELLITE_POSITION_URL,SAT_API_KEY} from '../constants';
import axios from 'axios';
import {feature} from "topojson-client";
import { geoKavrayskiy7 } from 'd3-geo-projection';
import {select as d3select} from "d3-selection";
import {geoPath,geoGraticule} from "d3-geo";
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import {Spin} from 'antd';
const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.state = {
            isLoading: false,
            isDrawing: false
        };

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
        // get Map canvas
        const canvas = d3select(this.refMap.current)
            .attr('width', width)
            .attr('height',height);

        // 找到画布
        // get Map canvas
        const canvas2 = d3select(this.refTrack.current)
            .attr('width', width)
            .attr('height',height);

        // 准备经纬线
        const graticule = geoGraticule();

        // console.log(graticule);

        // 将画布准备为2D
        // Map 的context
        let context = canvas.node().getContext('2d');

        // track 的context
        let context2 = canvas2.node().getContext('2d');


        // 画笔
        let path = geoPath().projection(projection).context(context);

    //    data <--> Map

        land.slice(0,20).forEach(ele=>{
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
        // 画经纬度
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

        this.map = {
            context: context,
            context2 : context2,
            projection : projection
        }
    }

    componentDidUpdate(preProps,prevState,snapshot){
        if (preProps.satData !== this.props.satData){
            const {
                latitude,
                longitude,
                elevation,
                duration
            } = this.props.observerData;
            const endTime = duration * 60;

            this.setState({
                isLoading: true
            });


            const urls = this.props.satData.map(sat=>{
                const {satid} = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`
                return axios.get(url);
            })

            Promise.all(urls)
                .then(results=>{
                    console.log(results);
                    const arr = results.map(res=>res.data);
                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }

                    this.setState({
                        isLoading: false,
                        isDrawing : true
                    });


                })
                .catch(e=>{
                    console.log(e);
                })
        }
    }

    track = data=>{
    //    check if there is any error
        if (data.length===0 || !data[0].hasOwnProperty('positions')){
            throw new Error("no position data");
        }
        const len = data[0].positions.length;
        // const {duration} = this.props.observerData;
        const {context2} = this.map;

        let now = new Date();
        let i = 0;

        let timer = setInterval(()=>{
            // get current time
            let ct = new Date();
            // get passed time
            let timePassed = i===0 ? 0 : ct-now;
            //时间加速60倍
            let time = new Date(now.getTime()+ 60*timePassed);

            // clear last position.
            context2.clearRect(0,0,width,height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);



            if (i>=len){
                clearInterval(timer);
                this.setState({
                    isDrawing : false
                });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            data.forEach(sat=>{
                const {info, positions}  =sat;
                this.drawSat(info,positions[i]);
            })

            i+=60;

        },1000)
    }

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");
        // console.log(nameWithNumber);
        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    };


    render() {
        const {isLoading}  = this.state;
        return (
            <div >
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className ="map" ref  = {this.refMap} />
                <canvas className ="track" ref = {this.refTrack} />
                <div className="hint"></div>
            </div>
        );
    }
}

export default WorldMap;