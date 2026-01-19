htmx.defineExtension('bny-alert', {
    // 响应转换
    transformResponse: function (text, xhr, elt) {

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


        if (xhr.getResponseHeader('Content-Type')
            .includes('application/json')) {

            // 解析JSON响应
            const data = JSON.parse(xhr.responseText)
            const color = type(data.code) // 获取颜色
            const anim = data.anim || 'scale' // 获取动画
            const time = data.time || 3 // 获取时间

            // 创建alert_open元素
            const alert_open = document.createElement('div')
            alert_open.classList.add('bny-alert-open')
            // 创建alert元素
            const alert = document.createElement('div')
            alert.classList.add('bny-alert', `bny-anim-${anim}`)
            alert.setAttribute('color', color)
            alert.innerHTML = data.msg
            // 将alert添加到alert_open
            alert_open.appendChild(alert)
            // 将alert_open添加到body
            document.body.appendChild(alert_open)
            // 设置定时器，移除alert_open
            setTimeout(() => {
                alert_open.remove()
            }, time * 1000)

            return elt.innerHTML
        }
    }
})