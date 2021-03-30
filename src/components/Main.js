import React, {Component} from 'react';
import {Row,Col} from 'antd';
import axios from "axios";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import {NEARBY_SATELLITE, STARLINK_CATEGORY,SAT_API_KEY} from "../constants";

class Main extends Component {
    constructor() {
        super();
        this.state = {
            satInfo:null,
            isLoading:null,
            setting:null,
            satList:null
        };
    }

    render() {
        const {satInfo,isLoading,setting,satList} = this.state;
        return (
            <Row className="main">
                <Col span={7} className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList
                        satInfo={satInfo}
                        isLoading={isLoading}
                        onShowMap = {this.onShowMap}
                    />
                </Col>
                <Col span={15} className="right-side">
                    <WorldMap
                        satData = {satList}
                        observerData={setting}
                    />
                </Col>
            </Row>
        );
    }
    onShowMap = selected=>{
        console.log(selected);
        this.setState(preState=>({
                ...preState,
                satList: [...selected]
            })
        )
    }

    showNearbySatellite = settings => {
        console.log(settings)
        // fetch data
        this.fetchSatellite(settings)
        this.setState({
            setting:settings
        })
    }

    fetchSatellite = settings =>{
        // deconstruction
        const {altitude,longitude,duration,elevation,latitude} = settings;
        this.setState({
            isLoading: true
        })
        // prepare url
        // for every request begin with api
        const url = "api/"
            + NEARBY_SATELLITE + "/"
            + latitude + "/"
            + longitude + "/"
            + elevation + "/"
            + altitude + "/"
            + STARLINK_CATEGORY + "/"
            + "&apiKey=" + SAT_API_KEY;

        axios.get(url)
            .then(response=>{
                this.setState({
                    satInfo:response.data,
                    isLoading: false
                });
            })
            .catch(e=>{
                this.setState({
                    isLoading: false
                })
                console.log(e);
            })
    }
}
export default Main;