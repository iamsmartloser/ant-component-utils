// 数据存储
export const cache = {
    set (key, data) {
        sessionStorage.setItem(key, JSON.stringify(data))
    },
    get (key) {
        return JSON.parse(sessionStorage.getItem(key))
    },
    clear (key) {
        sessionStorage.removeItem(key)
    }
}