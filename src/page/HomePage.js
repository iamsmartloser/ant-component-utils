import React, {Component,  Suspense} from 'react';
//BrowserRouter设置web基地址的，Route为页面路由
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Menu, Icon, Button, Spin} from 'antd';
import {Link} from 'react-router-dom'
const { SubMenu } = Menu;
class HomePage extends Component {

    getMenu=() => [
        {
            id: "1",
            name: "1",
            children: [{
                id: "11",
                name: "组件测试页面1",
                path: "/page"
            },
                {
                    id: "12",
                    name: "组件测试页面2",
                    path: "/page2"
                },
            ]
        },
        {
            id: "2",
            name: "2",
            children: [{
                id: "21",
                name: "组件使用及讲解",
                path: "/config/taskNoticeMessage"
            },
            ]
        },
    ];

    getIcon = icon => {
        if (typeof icon === "string") {
            return <Icon type={icon}/>;
        }
        return icon;
    };

    getNavMenuItems = (menusData, parent) => {
        if (!menusData) {
            return [];
        }
        return menusData
            .filter(item => item.name)
            .map(item => this.getSubMenuOrItem(item, parent))
            .filter(item => item);
    };

    getSubMenuOrItem = item => {
        if (item.children && item.children.some(child => child.name)) {
            const { name } = item;
            return (
                <SubMenu
                    title={
                        item.icon ? (
                            <span>
                             {this.getIcon(item.icon)}
                                <span>{name}</span>
                              </span>
                        ) : (
                            name
                        )
                    }
                    key={item.id}
                >
                    {this.getNavMenuItems(item.children)}
                </SubMenu>
            );
        }else {
            return <Menu.Item key={item.id}>{this.getMenuItemPath(item)}</Menu.Item>;
        }
    };

    getMenuItemPath = item => {
        const { name } = item;
        const { location } = this.props;
        return (
            <Link
                to={item.path}
                replace={true}
            >
                <span>{name}</span>
            </Link>
        );
    };

    render () {
        return(
            <Menu
                style={{width: '256px'}}
                key="Menu"
                mode={"inline"}
                defaultOpenKeys={['1']}
            >
                {this.getNavMenuItems(this.getMenu())}
            </Menu>
        )
    };
}

export default HomePage;
