import React, {Component} from 'react';
import { Button} from 'antd';

class TestPage2 extends Component {

    render () {
        return(
            <div className={'content-box'}>
                <Button>普通按钮2</Button>
                <Button type={'primary'}>主按钮2</Button>
            </div>
        )
    };
}

export default TestPage2;
