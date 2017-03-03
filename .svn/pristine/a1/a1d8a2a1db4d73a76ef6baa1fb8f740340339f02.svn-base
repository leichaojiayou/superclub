const saveSync = (key, value) => {
    wx.setStorageSync(key, value)
}

const getSync = (key) => {
    let value = wx.getStorageSync(key)
    let defaultValue = null;
    if (value){
        defaultValue = value
    }
    return defaultValue
}

module.exports = {
    saveSync, getSync
}