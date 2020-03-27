import React, {Component} from 'react';
import { Button} from 'antd';
import httpRequest from '../utils/request.js'
import {baseUrl} from "../config/apiConfig";
class TestPage extends Component {

    componentDidMount(){
        let response=httpRequest.get(`${baseUrl}/query`,{params:{name:'liyan'}});
        console.log('response:',response);
        console.log('response type:',typeof response)
        response.then(res=>{
            console.log('res:',res)
        }).catch(err=>{
            console.log('errrrrrr:',err)
        })
    }
    render () {
        return(
            <div className={'content-box'}>
                <Button>普通按钮</Button>
                <Button type={'primary'}>主按钮</Button>
            </div>
        )
    };
}

export default TestPage;
