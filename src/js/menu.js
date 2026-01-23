htmx.defineExtension('bny-menu', {
    // 事件
    onEvent: function (name, evt) {

        // 在htmx初始化节点后触发
        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, 'bny-menu')) {
                evt.target.addEventListener('click', function (e) {
                    const item = e.target.closest('.item')
                    let subMenu = item.querySelector('.sub-menu')
                    if (item && subMenu) {
                        item.classList.toggle('show')
                    }
                })
                return false
            }
        }
        return true;
    },
    // 响应转换
    transformResponse: function (text, xhr, elt) {
        /**
         * 获取菜单
         * 
         * @param {Array} arr list
         * @returns {String} html
         */
        function getMenu(arr) {
            let html = ""
            arr.forEach(v => {
                const attrStr = bny.parAttrStr(v.attr)
                html += `<div class="item" ${attrStr}>`
                html += `<div class="trigger" bny-id="${v.id}">`
                html += `<span>${v.name}</span>`
                if (v.child) {
                    html += `<i class="bny-icon">&#xe76e;</i>`
                }
                html += `</div>`
                if (v.child) {
                    html += `<div class="sub-menu">`
                    html += getMenu(v.child)
                    html += `</div>`
                }
                html += `</div>`
            });
            return html
        }

        /**
         * 获取菜单
         * 
         * @param {String} data json
         * @returns {String} html
         */
        function getHtml(data) {
            const obj = JSON.parse(data)
            return getMenu(obj.data)
        }

        if (xhr.getResponseHeader('Content-Type')
            .includes('application/json')) {
            const body = getHtml(xhr.responseText)
            return body
        }
        return text;
    }
});