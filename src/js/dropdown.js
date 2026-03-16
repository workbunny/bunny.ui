htmx.defineExtension('bny-dropdown', {
    // 事件
    onEvent: function (name, evt) {
        
        // 在htmx初始化节点后触发
        if (name === 'htmx:afterProcessNode') {
            if (bny.hasExtName(evt.target, 'bny-dropdown')) {
                const dropdown = document.createElement('div')
                dropdown.classList.add('bny-dropdown')
                const content = document.createElement('div')
                content.classList.add('content')
                dropdown.appendChild(content)
                evt.target.appendChild(dropdown)
                // 点击事件
                evt.target.addEventListener("click", (e) => {
                    // 点击下拉菜单区域时，不关闭菜单
                    if (e.target.closest('.bny-dropdown')) {
                        htmx.addClass(dropdown, 'show')
                    } else {
                        htmx.toggleClass(dropdown, "show")
                    }
                })
                return false
            }
            return true
        }
        // 在交换前触发，允许你配置交换
        if (name === "htmx:beforeSwap") {
            if (bny.hasExtName(evt.target, 'bny-dropdown')) {
                const dropdown = bny.queryChild(evt.target, '.bny-dropdown')
                const content = bny.queryChild(dropdown, '.content')
                if (!bny.hasClass(dropdown, 'show') || content.innerHTML.trim() === '') {
                    htmx.swap(
                        content,
                        evt.detail.xhr.responseText,
                        { swapStyle: "innerHTML" }
                    )
                }
                return false
            }
        }
        return true
    }
})