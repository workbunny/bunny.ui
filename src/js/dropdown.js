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
                document.addEventListener("click", (e) => {
                    const parent = dropdown.parentElement
                    if (e.target !== parent && !e.target.closest('.bny-dropdown')) {
                        htmx.removeClass(dropdown, "show")
                    }
                })
            }
            return true
        }
        // 在交换前触发，允许你配置交换
        if (name === "htmx:beforeSwap") {
            if (bny.hasExtName(evt.target, 'bny-dropdown')) {
                const dropdown = evt.target.querySelector('.bny-dropdown')
                // 判断dropdown是否已经显示
                if (!bny.hasClass(dropdown, "show")) {
                    htmx.swap(
                        dropdown.querySelector('.content'),
                        evt.detail.xhr.responseText,
                        { swapStyle: "innerHTML" }
                    )
                    htmx.toggleClass(dropdown, "show")
                }
                return false
            }
        }
        return true
    }
})