import React, {Component} from 'react';
import { List,Button,Spin,Avatar,Checkbox} from 'antd';
import satellite from '../assets/images/satellite.svg';
class SatelliteList extends Component {
    state = {
        selected :[]
    }
    onChange = e=>{
        // 1.get dataInfo from box checked
        const {dataInfo, checked} = e.target;

        // 2. add or remove depend on the checked or unchecked
        const {selected} = this.state;
        const list = this.addOrRemove(dataInfo,checked,selected);
        // setState
        this.setState({selected: list})
    }

    addOrRemove = (sat, status,list)=>{
        // case 1 : check if true
    //          -> sat in list: add it
    //          -> sat not in the list : N/A
    //     case 2 : if false
    //          -> sat in the list : remove it
    //          -> sat not in the list : N/A
        const found = list.some(item=> item.satid===sat.satid);

        if (status && !found){
            //add it
            list = [...list, sat]
        }
        if (!status && found){
            //remove it
            list = list.filter(item=> item.satid!==sat.satid);
        }
        return list;
    }

    onShowSatMap = () =>{
        this.props.onShowMap(this.state.selected);
    }

    render() {
        const {isLoading} = this.props;
        const { selected } = this.state;
        const satList = this.props.satInfo ? this.props.satInfo.above : [] ;
        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn" size="large"
                        disabled = {selected.length === 0}
                        //onClick={this.props.onShowMap(this.state.selected)}
                        onClick = {this.onShowSatMap}
                >
                    Track on the map
                </Button>
                <hr/>
                <div>{
                    isLoading
                        ?
                        <div className='spin-box'>
                            <Spin tip="Loading..." size="large"/>
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout='horizontal'
                            dataSource={satList}
                            renderItem={
                                item=>(
                                        <List.Item
                                            actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                        >
                                            <List.Item.Meta
                                            avatar={<Avatar size={50} src={satellite}/>}
                                            title={<p>{item.satname}</p>}
                                            description={`Launch Date: ${item.launchDate}`}
                                            />
                                        </List.Item>
                                )
                            }
                        />
                }</div>
            </div>

        );
    }
}

export default SatelliteList;