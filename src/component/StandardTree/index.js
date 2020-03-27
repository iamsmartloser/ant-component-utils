/**
 * @description 树控件
 * @author 李艳
 */
import React, { Component } from 'react';
import { Input, Tree, Card, Icon } from 'antd';
import { cloneDeep } from 'lodash';
import ScrollBar from '../../components/ScrollBar';
import styles from './index.less';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

class StandardTree extends Component {

  static propTypes = {
    title: PropTypes.any.isRequired,  //树控件的左上角标题，可传入自定义布局
    extra: PropTypes.object,   //树控件的右上角操作组建（查询框、按钮等），可传入自定义布局
    showSearch: PropTypes.bool,   //是否显示查询框，默认显示
    draggable: PropTypes.bool,  //是否可以拖动，默认不可以
    checkable: PropTypes.bool, //是否有多选框
    checkedKeys: PropTypes.array,//（受控）选中复选框的树节点（注意：父子节点有关联，如果传入父节点 key，
    // 则子节点自动选中；相应当子节点 key 都传入，父节点也自动选中。当设置checkable和checkStrictly，
    // 它是一个有checked和halfChecked属性的对象，并且父子节点的选中与否不再关联
    checkStrictly: PropTypes.bool,  //checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
    searchPlaceholder: PropTypes.string,  //查询框默认提示信息
    childCode: PropTypes.string,  //树的子节点的代码，因为有些数据源的子节点叫child有些又叫children
    dataSource: PropTypes.array,  //树控件源数据
    reader: PropTypes.shape({   //树控件行项目显示字段配置，，
      name: PropTypes.string,   //name为主要显示字段，不传入默认为name字段
      nameSuffix: PropTypes.array,// name的后缀显示内容，不传入不显示,传入形如[{beforeDesc:'(',afterDesc:')',code:'code'}]
      description: PropTypes.array,   //(此字段不推荐配置，不符合常规的页面展示) description为辅助显示字段，
      // 不传入不显示,形如[{beforeDesc:'(',afterDesc:')',code:'code'}]
    }),
    onSelect: PropTypes.func,  //单选时调用的方法
    onCheck: PropTypes.func,  //多选时调用的方法
    onDrop: PropTypes.func,  //拖动时调用的方法
  };

  static defaultProps = {
    title: '',
    extra: null,
    showSearch: true,
    draggable: false,
    checkable: false,
    searchPlaceholder: '输入关键字查询',
    childCode: 'children',
    checkedKeys: [],
    reader: {
      name: 'name',
      nameSuffix: null,
      description: null,  ////此字段不推荐配置，不符合常规的页面展示
    },
  };


  constructor(props) {
    super(props);
    const { reader } = props;
    const { description } = reader;   //此字段不推荐配置，不符合常规的页面展示
    this.state = {
      dataSource: [],
      searchValue: '',
      findResultData: [],
      autoExpandParent: true,
      expandedKeys: [],
      selectedKeys: [],
      selectedNodes: {},
      loading: false,
      yHeight: null,
    };
    this.styleProps = !description ? {} : { className: cls(styles['tree-node-title']) };
  }

  componentWillReceiveProps(nextProp) {
    let { dataSource } = nextProp;
    const { dataSource: data, searchValue } = this.state;
    if (!(dataSource instanceof Array)) {
      dataSource = [dataSource];
    }
    if (data !== dataSource) {
      this.setState({ dataSource }, () => {
        searchValue && this.handleSearch(searchValue);
      });
    }
  }

  /**
   * 通过key值查找节点信息
   * @param dataSource
   * @param key
   * @returns {*|void}
   */
  getNodeByKey = (dataSource, key) => {
    const { childCode } = this.props;
    for (let item of dataSource) {
      if (item.id === key) {
        return item;
      } else {
        if (item[childCode] && item[childCode].length > 0) {
          if (this.getNodeByKey(item[childCode], key)) {
            return this.getNodeByKey(item[childCode], key);
          }
        }
      }
    }
  };

  /**
   * 通过多个key值查找多个节点信息
   * @param dataSource
   * @param keys
   * @returns {*}
   */
  getNodesByKeys(dataSource, keys) {
    let nodes = [];
    if (keys instanceof Array) {
      for (let key of keys) {
        let node = this.getNodeByKey(dataSource, key);
        nodes.push(node);
      }
    } else {
      return this.getNodeByKey(dataSource, keys);
    }
    return nodes;
  }

  /**
   * 树节点选择触发
   * @param selectedKeys
   */
  onSelect = (selectedKeys) => {
    const { onSelect } = this.props;
    const { dataSource } = this.state;
    this.setState({ selectedKeys });
    let selectedNodes = this.getNodesByKeys(dataSource, selectedKeys);
    if (onSelect) {
      onSelect(selectedKeys, selectedNodes);
    }
  };

  /**
   * 树节点选择(单选、多选)触发
   * @param selectedKeys
   */
  onCheck = (selectedKeys) => {
    const { onCheck } = this.props;
    const { dataSource } = this.state;
    let selectedNodes = [];
    if (selectedKeys && selectedKeys instanceof Array) {
      selectedNodes = this.getNodesByKeys(dataSource, selectedKeys);
    } else if (selectedKeys && selectedKeys.checked) {
      selectedNodes = this.getNodesByKeys(dataSource, selectedKeys.checked);
    }
    if (onCheck) {
      onCheck(selectedKeys, selectedNodes);
    }
  };

  /**
   * 搜索框关键字搜索，查找树节点
   * @param value
   */
  handleSearch = (value) => {
    const { dataSource } = this.state;
    let data = cloneDeep(dataSource);
    let findResultData = this.findNode(value, data);
    this.keyList = [];
    this.getExpandedKeys(findResultData);
    let expandedKeys = this.keyList;
    if (value === '') {//没有搜索关键字
      this.setState({
        findResultData: findResultData,
        searchValue: value,
        autoExpandParent: false,
        expandedKeys: [],
      });
    } else {
      this.setState({
        findResultData: findResultData,
        searchValue: value,
        autoExpandParent: true,
        expandedKeys: expandedKeys,
      });
    }
  };

  /**
   * 获取展开节点的keys
   * @param data
   */
  getExpandedKeys = (data) => {
    const { childCode } = this.props;
    for (let item of data) {
      this.keyList.push(item.id);
      if (item[childCode] && item[childCode].length > 0) {
        this.getExpandedKeys(item[childCode]);
      }
    }
  };

  /**
   * 树控件展开时
   * @param expandedKeys
   */
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  /**
   * 查找关键字节点
   * @param value
   * @param tree
   * @returns {*}
   */
  findNode = (value, tree) => {
    const { childCode } = this.props;
    return tree.map(treeNode => {
      //如果有子节点
      if (treeNode[childCode] && treeNode[childCode].length > 0) {
        treeNode[childCode] = this.findNode(value, treeNode[childCode]);
        //如果标题匹配(增加大小写非敏感查询)
        if (treeNode.name.toUpperCase().indexOf(value ? value.toUpperCase() : '') > -1) {
          return treeNode;
        } else {//如果标题不匹配，则查看子节点是否有匹配标题
          treeNode[childCode] = this.findNode(value, treeNode[childCode]);
          if (treeNode[childCode] && treeNode[childCode].length > 0) {
            return treeNode;
          }
        }
      } else {//没子节点(增加大小写非敏感查询)
        if (treeNode.name.toUpperCase().indexOf(value ? value.toUpperCase() : '') > -1) {
          return treeNode;
        }
      }
    }).filter((treeNode, i, self) => treeNode);
  };

  /**
   * 渲染节点信息，并且高亮显示查询信息
   * @param data
   * @returns {*}
   */
  renderTreeNodes = (data) => {
    const { reader, childCode } = this.props;
    const { searchValue } = this.state;
    const { name = 'name', nameSuffix, description } = reader;
    return data.map((item) => {
      const i = item[name].indexOf(searchValue);
      const beforeStr = item[name].substr(0, i);
      const afterStr = item[name].substr(i + searchValue.length);
      let title = '';
      if(nameSuffix){
        nameSuffix.map(suff => {
          let { beforeDesc, afterDesc, code } = suff;
          item.nameSuffix = `${beforeDesc || ''}${item[code] || ''}${afterDesc || ''}  `;
        });
      }

      if (description) {
        description.map(desc => {
          let { beforeDesc, afterDesc, code } = desc;
          item.description = `${beforeDesc || ''}${item[code] || ''}${afterDesc || ''}  `;
        });
        //含description的title
        title = i > -1 ? (
          <span title={`${item[name]}  ${item.nameSuffix||''}`}>{beforeStr}
            <span className={cls(styles['high-light-title'])}>{searchValue}</span>
            {afterStr}<span className={cls(styles['nameSuffix'])}>{item.nameSuffix || ''}</span>
            <div className={cls(styles['description'])}>{item.description || ''}</div>
                </span>)
          : <span title={`${item[name]}  ${item.nameSuffix||''}`}>
            <span>{item[name]}<span className={cls(styles['nameSuffix'])}>{item.nameSuffix || ''}</span></span>
            <div>{item.description || ''}</div>
          </span>;
      } else {
        //不含description的title
        title = i > -1 ? (
          <span title={`${item[name]}  ${item.nameSuffix||''}`}>{beforeStr}
          <span className={cls(styles['high-light-title'])}>{searchValue}</span>
            {afterStr}<span className={cls(styles['nameSuffix'])}>{item.nameSuffix || ''}</span>
          </span>)
          : <span title={`${item[name]}  ${item.nameSuffix||''}`}><span>{item[name]}</span>
            <span className={cls(styles['nameSuffix'])}>{item.nameSuffix || ''}</span></span>;
      }

      if (item[childCode] && item[childCode].length > 0) {
        return (
          <TreeNode title={title} key={item.id}>
            {this.renderTreeNodes(item[childCode])}
          </TreeNode>
        );
      }
      return <TreeNode title={title} key={item.id} isLeaf/>;
    });
  };
  /**
   * 移动节点 拖拽移动 （本项目不推荐拖拽移动）
   * @param info
   */
  onDrop = (info) => {
    const { childCode, onDrop } = this.props;
    const { dataSource } = this.state;
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;

    const loop = (data, id, callback) => {
      data.forEach((item, index, arr) => {
        if (item.id === id) {
          return callback(item, index, arr);
        }
        if (item[childCode]) {
          return loop(item[childCode], id, callback);
        }
      });
    };

    const data = [...dataSource];
    let dragNode = this.getNodeByKey(data, dragKey);//获取移动节点信息
    let targetNode = this.getNodeByKey(data, dropKey); //获取目标节点信息
    onDrop && onDrop(dragNode, targetNode, info.dropToGap);   //删除参数一般这样拼接：params = { nodeId: dragKey, targetParentId: dropKey }

    //以下判断放到父组件比较好，不在组件里面写死

    // let params = {};
    // let dragNode = this.getNodeByKey(data, dragKey);//获取移动节点信息
    // if (!dragNode.parentId) {
    //   message.error('无法移动根节点！');
    //   return;
    // }
    // let node = this.getNodeByKey(data, dropKey); //获取目标节点信息
    // if (info.dropToGap) {
    //   if (!node.parentId) {
    //     message.error('无法将节点设置为根节点！');
    //     return;
    //   } else {
    //     params = { nodeId: dragKey, targetParentId: node.parentId };
    //   }
    // } else {
    //   params = { nodeId: dragKey, targetParentId: dropKey };
    // }
    // if (this.props.moveService) {
    //   this.props.moveService(params).then((result) => {
    //     if (result.status === 'SUCCESS') {
    //       message.success(result.message ? result.message : '移动成功');
    //       // 更新本地树,有时后台获取的数据格式不一样，交给外层处理
    //       if (this.props.initService) {
    //         this.props.initService();
    //       }
    //     } else {
    //       message.error(result.message ? result.message : '移动失败');
    //     }
    //   }).catch(err => {
    //   }).finally(() => {
    //   });
    // }
  };

  render() {
    const { title, extra, checkable, draggable, checkStrictly, searchPlaceholder, showSearch, selectedKeys: select, ...reset } = this.props;
    const { searchValue, selectedKeys, dataSource, findResultData } = this.state;
    return (
      <div className={cls(styles['ux-standard-tree'])}>
        <Card
          title={typeof title === 'string' ? (title || '')
            : <div className={cls(styles['header-tool-box'])}>
              {title && title()}
            </div>}
          bordered={false}
          bodyStyle={{ height: 'calc(100vh - 60px)' }}
          extra={extra !== false ?
            <div className={cls(styles['header-tool-box'])}>
              {showSearch && <Search
                placeholder={searchPlaceholder}
                onSearch={e => this.handleSearch(e)}
                onChange={(e) => {
                  if (!e.target.value) {
                    this.handleSearch(e.target.value);
                  }
                }}//点叉叉的时候
                allowClear
                style={{ width: 172 }}
              />}
              {extra && extra()}
            </div> : null
          }
        >
          <ScrollBar>
            <div {...this.styleProps}>
              <Tree
                switcherIcon={<Icon type="down"/>}
                checkedKeys={select ? select : selectedKeys}
                checkStrictly={checkStrictly}
                expandAction={'doubleClick'}
                onSelect={this.onSelect}
                autoExpandParent={this.state.autoExpandParent}
                expandedKeys={this.state.expandedKeys}
                onExpand={this.onExpand}
                checkable={checkable}
                onCheck={this.onCheck}
                draggable={draggable}
                onDrop={this.onDrop}
                {...reset}>
                {this.state.dataSource.length > 0 ?
                  this.renderTreeNodes(searchValue === '' ? dataSource : findResultData)
                  : <TreeNode
                    key="empty"
                    title={formatMessage({ id: 'loading', defaultMessage: '加载中...' })}
                    selectable={false}
                  />}
              </Tree>
            </div>
          </ScrollBar>
        </Card>
        )
      </div>
    );
  }
}

export default StandardTree;
