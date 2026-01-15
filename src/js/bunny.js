window.bny = {

    /**
     * 检查元素是否有指定的扩展名
     * 
     * @param {HTMLElement} elt 元素
     * @param {String} ext 扩展名
     * @returns {Boolean} 是否有扩展名
     */
    hasExtName: function (elt, ext) {
        const attrs = elt.getAttribute('hx-ext')
        if (!attrs) return false
        const exts = attrs.trim().split(/\s+/)
        return exts.includes(ext)
    }
}