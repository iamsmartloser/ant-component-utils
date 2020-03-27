/**
 * Created by liusonglin on 2018/7/12.
 */
import React, {Component, lazy, Suspense} from 'react';
//BrowserRouter设置web基地址的，Route为页面路由
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Spin} from "antd";

const HomePage = lazy(() => import("../page/HomePage"));
const TestPage = lazy(() => import("../page/TestPage"));
const TestPage2 = lazy(() => import("../page/TestPage2"));
export default class Routers extends Component {
    render() {
        return (
            <Router basename={'/pages'}>
                <Suspense
                    fallback={<Spin/>}
                >
                    <Switch>
                        <Route path="/" component={()=>(
                            <div className={'home-page'}>
                                <HomePage/>
                                <Route path="/page"  component={TestPage}/>
                                <Route path="/page2" component={TestPage2}/>
                            </div>
                        )
                        } />
                    </Switch>
                </Suspense>
            </Router>


        );
    }
}
