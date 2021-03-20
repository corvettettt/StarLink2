import React, {Component} from 'react';
import {Form} from 'antd'

class SatSettingForm extends Component {
    //const {getFieldDecorator} = this.props.form;
    render() {
        console.log(this.form);
        return (
            <Form>
                <Form.Item label="Longitude(degrees)"/>
                    {

                    }
                <Form.Item label="Latitude(degrees)"/>
            </Form>
        );
    }
}

const SatSetting = Form.create()(SatSettingForm);
//Form.create() create a function, then this func operate on the SatSettingForm;
// HOC ->
//  - take a component as parameter
//  - return a new component
export default SatSetting;