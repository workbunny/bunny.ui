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
    },
    /**
     * 解析属性字符串
     * 
     * @param {object} obj 属性对象
     * @returns {String} 属性字符串
     */
    parAttrStr: function (obj) {
        let str = ""
        for (const key in obj) {
            str += ` ${key}="${obj[key]}" `
        }
        return str
    },
    /**
     * 移除元素的类名
     * 
     * @param {Object|HTMLElement} elt 元素或元素数组
     * @param {String} cls 类名
     */
    removeClass: function (elt, cls) {
        if (Array.isArray(elt) || elt instanceof NodeList) {
            Array.from(elt).forEach(e => this.removeClass(e, cls))
            return
        }
        if (elt.classList) {
            elt.classList.remove(cls)
        }
    },
    /**
     * 检查元素是否有指定的类名
     * 
     * @param {HTMLElement} elt 元素
     * @param {String} cls 类名
     * @returns {Boolean} 是否有类名
     */
    hasClass: function (elt, cls) {
        return elt.classList?.contains(cls) || false
    },
    /**
     * 显示警示弹窗
     * 
     * @param {String} msg 消息
     * @param {Number} code 状态码 默认0
     * @param {String} anim 动画 默认scale
     * @param {Number} time 时间 默认3秒
     */
    alert: function (msg, code = 0, anim = 'scale', time = 3) {

        /**
         * 根据状态码获取颜色
         * 
         * @param {number} code 状态码
         * @returns {string} 颜色
         */
        function type(code) {
            switch (code) {
                case 1:
                    return 'green'
                case 2:
                    return 'yellow'
                case 3:
                    return 'red'
                case 4:
                    return 'blue'
                default:
                    return ''
            }
        }
        const color = type(code) // 获取颜色
        // 创建alert_open元素
        const alert_open = document.createElement('div')
        alert_open.classList.add('bny-alert-open')
        // 创建alert元素
        const alert = document.createElement('div')
        alert.classList.add('bny-alert', `bny-anim-${anim}`)
        alert.setAttribute('color', color)
        alert.style.width = 'auto'
        alert.innerHTML = msg
        // 将alert添加到alert_open
        alert_open.appendChild(alert)
        // 将alert_open添加到body
        document.body.appendChild(alert_open)
        // 设置定时器，移除alert
        setTimeout(() => {
            alert_open.remove()
        }, time * 1000)
    },
    /**
     * 显示确认弹窗
     * 
     * @param {String} msg 消息
     * @param {Object} options 选项
     * @param {String} options.title 标题 默认 提示
     * @param {String} options.anim 动画 默认 scale
     * @param {Function} options.yes_cb 确认回调 默认空函数
     * @param {Function} options.no_cb 取消回调 默认空函数
     */
    confirm: function (
        msg = '确认操作吗？',
        options = {
            title: "提示",
            anim: 'scale',
            yes_cb: () => { },
            no_cb: () => { },
        }) {
        const title = options.title || '提示'
        const anim = options.anim || 'scale'
        const yes_cb = options.yes_cb || (() => { })
        const no_cb = options.no_cb || (() => { })
        // 创建confirm_shield元素
        const confirm_shield = document.createElement('div')
        confirm_shield.classList.add('bny-confirm-shield')
        confirm_shield.addEventListener('click', () => {
            confirm_shield.remove()
        })
        // 创建confirm元素
        const confirm = document.createElement('div')
        confirm.classList.add('bny-confirm', `bny-anim-${anim}`)
        // 创建title元素
        const confirm_title = document.createElement('h3')
        confirm_title.classList.add('title')
        confirm_title.innerHTML = title
        // 创建content元素
        const confirm_content = document.createElement('p')
        confirm_content.classList.add('content')
        confirm_content.innerHTML = msg
        // 创建btn元素
        const confirm_btn = document.createElement('div')
        confirm_btn.classList.add('btn')
        // 创建确认按钮
        const confirm_yes = document.createElement('button')
        confirm_yes.classList.add('bny-btn')
        confirm_yes.setAttribute('color', 'blue')
        confirm_yes.innerHTML = '确认'
        confirm_yes.addEventListener('click', (e) => {
            yes_cb()
            e.stopPropagation()
            confirm_shield.remove()
        })
        // 创建取消按钮
        const confirm_no = document.createElement('button')
        confirm_no.classList.add('bny-btn')
        confirm_no.innerHTML = '取消'
        confirm_no.addEventListener('click', (e) => {
            no_cb()
            e.stopPropagation()
            confirm_shield.remove()
        })
        // 将确认按钮添加到btn
        confirm_btn.appendChild(confirm_yes)
        // 将取消按钮添加到btn
        confirm_btn.appendChild(confirm_no)
        // 将title添加到confirm
        confirm.appendChild(confirm_title)
        // 将content添加到confirm
        confirm.appendChild(confirm_content)
        // 将btn添加到confirm
        confirm.appendChild(confirm_btn)
        // 将confirm添加到confirm_shield
        confirm_shield.appendChild(confirm)
        // 将confirm_shield添加到body
        document.body.appendChild(confirm_shield)
    }
}