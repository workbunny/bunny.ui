htmx.defineExtension('bny-code', {
    // 事件
    onEvent: function (name, evt) {
        // 在htmx初始化节点后触发
        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, 'bny-code')) {
                // 处理代码内容
                const content = evt.target.innerHTML
                evt.target.innerHTML = ""
                // 创建code元素
                const code = document.createElement('code')
                code.innerHTML = content.trim()
                evt.target.appendChild(code)
                // 创建复制按钮
                const copyBtn = document.createElement('a')
                copyBtn.setAttribute("title", "复制代码")
                copyBtn.classList.add('copy-btn')
                copyBtn.innerHTML = '<i class="bny-icon icon-file-copy"></i>'
                evt.target.appendChild(copyBtn)
                // 复制按钮点击事件
                copyBtn.addEventListener("click", (e) => {
                    navigator.clipboard.writeText(code.textContent)
                    bny.alert('复制成功')
                })
            }
        }

        // 	在交换前触发，允许你配置交换
        if (name === "htmx:beforeSwap") {
            if (bny.hasExtName(evt.target, 'bny-code')) {
                const code = evt.target.querySelector('code')
                let content = evt.detail.xhr.responseText
                if (evt.detail.xhr.getResponseHeader('Content-Type')
                    .includes('application/json')) {
                    const json = JSON.parse(content)
                    content = json.data
                }
                htmx.swap(code, bny.escapeChars(content), { swapStyle: 'innerHTML' })
                return false
            }
        }
        return true
    }
})