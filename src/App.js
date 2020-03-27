import React, {Component} from 'react';
import Routers from "./config/router";
import {ConfigProvider} from 'antd';
import './App.css';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import HomePage from "./page/HomePage";
import TestPage from "./page/TestPage";

moment.locale('zh-cn');

class App extends Component {
    render() {
        return (
            <ConfigProvider locale={zhCN}>
                <div className="App">
                    {/*<HomePage/>*/}
                    {/*<TestPage/>*/}
                    <Routers/>
                </div>
            </ConfigProvider>
        )
    };
}

export default App;
