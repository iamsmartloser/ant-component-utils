import axios from 'axios';
import {message} from 'antd'
import {cache} from './commonUtils';
import {host} from "../config/apiConfig";


const httpRequest = axios.create({
    //当创建实例的时候配置默认配置
    xsrfCookieName: 'xsrf-token',
    timeout:100001,
    headers:getHeader()
});

/**
 * 配置请求头
 * @returns {*}
 */
export function getHeader() {
    let authHeader = cache.get("authHeader")
    if (authHeader) {
        return authHeader;
    }
    try {
        let auth = cache.get('Authorization');
        authHeader = {
            'Content-Type': 'application/json;charset=UTF-8',
            'Cache-Control': 'no-cache',
            'Authorization': auth ? (auth.accessToken ? auth.accessToken : '') : ''
        }
    } catch (e) {
    }
    return authHeader;
}

/**
 * 添加请求拦截器
 */
httpRequest.interceptors.request.use(function (config) {
    if (config.url.indexOf('http') === -1) {
        config.url = host + config.url
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

/**
 * 添加一个响应拦截器
 */
httpRequest.interceptors.response.use(function (response) {
    // 1.成功
    if (response.status === 200) {
        return response.data
    }
    if (response.status === 204) {
        return;
    }
    // 3.其他失败，比如校验不通过等
    message.error(response.msg)
    return Promise.reject(response.data);
}, function (err) {
    if (err && err.response) {
        switch (err.response.status) {
            case 400:
                err.message = '请求错误(400)';
                break;
            case 401:
                err.message = '未授权，请重新登录(401)';
                break;
            case 403:
                err.message = '拒绝访问(403)';
                break;
            case 404:
                err.message = '请求出错(404)';
                break;
            case 408:
                err.message = '请求超时(408)';
                break;
            case 500:
                err.message = '服务器错误(500)';
                break;
            case 501:
                err.message = '服务未实现(501)';
                break;
            case 502:
                err.message = '网络错误(502)';
                break;
            case 503:
                err.message = '服务不可用(503)';
                break;
            case 504:
                err.message = '网络超时(504)';
                break;
            case 505:
                err.message = 'HTTP版本不受支持(505)';
                break;
            default:
                err.message = `连接出错(${err.response.status})!`;
        }
        if (err.response.status === 401) {
            return;
        }
        if (err.response.data) {
            err.message = err.message + "  " + err.response.data.msg
        }
    } else {
        err.message = '连接服务器失败!'
    }
    message.error(err.message)
    console.error(err)
    return
});

/**
 *   axios#  request(config)
 *   axios#  et(url[, config])
 *   axios#  delete(url[, config])
 *   axios#  head(url[, config])
 *   axios#  options(url[, config])
 *   axios#  post(url[, data[, config]])
 *   axios#  put(url[, data[, config]])
 *   axios#  patch(url[, data[, config]])
 *   axios#  getUri([config])
 * @param url
 * @param config  {} params:参数放在url上，data：参数不放在url上
 * @returns {Promise<any>}
 */

export default httpRequest
