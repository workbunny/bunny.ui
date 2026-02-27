htmx.defineExtension('bny-tab', {
    onEvent: function (name, evt) {

        /**
         * 添加移动按钮
         * @param {HTMLElement} target 头元素
         * @returns {void}
         */
        function addMoveBtn(target) {
            // 添加滚动条
            const head = bny.queryChild(target, ".head")
            head.classList.add("scrollbar")
            head.style.cssText = "padding: 0px 40px;"
            // 左移动按钮
            const leftBtn = document.createElement("div")
            leftBtn.className = "btn-left"
            leftBtn.innerHTML = `<i class="bny-icon icon-zuohua"></i>`
            target.appendChild(leftBtn)
            // 右移动按钮
            const rightBtn = document.createElement("div")
            rightBtn.className = "btn-right"
            rightBtn.innerHTML = `<i class="bny-icon icon-youhua"></i>`
            target.appendChild(rightBtn)
        }

        /**
         * 添加关闭按钮
         * @param {HTMLElement} target 头元素
         * @returns {void}
         */
        function addCloseBtn(target) {
            const closeBtn = document.createElement("i")
            closeBtn.className = "bny-icon icon-cuo"
            target.appendChild(closeBtn)
        }

        /**
         * 绑定事件
         * @param {HTMLElement} target 头元素
         * @param {string} trigger 事件类型
         * @returns {void}
         */
        function onTrigger(target, trigger) {
            // 定义标签切换逻辑
            function switchTab(li) {
                if (li) {
                    // 获取所有的 li 元素
                    let lis = li.parentElement.children
                    // 获取所有的 body 元素
                    let bodys = li.parentElement.parentElement.querySelector(".body").children
                    let index = bny.indexOf(li)
                    // 切换标签
                    bny.removeClass(lis, "this")
                    bny.removeClass(bodys, "show")
                    htmx.addClass(lis[index], "this")
                    htmx.addClass(bodys[index], "show")
                }
            }

            // 对于其他事件类型，直接添加监听器
            target.addEventListener(trigger, function (e) {
                // console.log(e.target)
                const li = e.target.closest(".head>li")
                switchTab(li)
                e.stopPropagation()
            })
        }

        // 其他点击事件
        function onClicks(target) {
            target.addEventListener("click", (e) => {
                // 点击删除标签
                const closeBtn = e.target.closest("li>i.icon-cuo")
                if (closeBtn) {
                    const index = bny.indexOf(closeBtn.parentElement)
                    if (index === null) return
                    const li = bny.queryChild(target, ".head>li:nth-child(" + (index + 1) + ")")
                    const body = bny.queryChild(target, ".body>div:nth-child(" + (index + 1) + ")")
                    // 删除标签
                    li.remove()
                    body.remove()
                    // 切换下一个标签
                    if (li.classList.contains("this")) {
                        const nextLi = bny.queryChild(target, ".head>li")
                        if (!nextLi) return
                        const nextIndex = bny.indexOf(nextLi)
                        const nextBody = bny.queryChild(target, ".body>div:nth-child(" + (nextIndex + 1) + ")")
                        htmx.addClass(nextLi, "this")
                        htmx.addClass(nextBody, "show")
                    }
                    e.stopPropagation()
                }
                // 点击左滑动
                const leftBtn = e.target.closest("div.btn-left")
                if (leftBtn) {
                    const head = bny.queryChild(target, ".head")
                    head.scrollBy({ left: -100, behavior: "smooth" })
                }
                // 点击右滑动
                const rightBtn = e.target.closest("div.btn-right")
                if (rightBtn) {
                    const head = bny.queryChild(target, ".head")
                    head.scrollBy({ left: 100, behavior: "smooth" })
                }
            })
        }

        /**
         * 初始化选项卡
         * @param {HTMLElement} target 选项卡元素
         */
        function tabInit(target) {
            const heads = bny.queryChildAll(target, ".head>li");
            const bodys = bny.queryChildAll(target, ".body>div");
            // 事件
            const trigger = target.getAttribute("hx-trigger") ?? "click";
            // 模式
            const mode = target.getAttribute("mode") ?? "normal"
            // 索引
            const index = Number(target.getAttribute("index") ?? 0)
            // 补全body
            const addBody = heads.length - bodys.length
            for (let i = 0; i < addBody; i++) {
                const body = document.createElement("div")
                bny.queryChild(target, ".body").appendChild(body)
                // 处理给定元素及其子元素，连接任何htmx行为
                htmx.process(body)
            }
            // 处理头
            for (let i = 0; i < heads.length; i++) {
                heads[i].setAttribute("hx-trigger", trigger)
                if (heads[i].getAttribute("closable") !== null &&
                    !heads[i].querySelector(":scope>i.icon-cuo")) {
                    addCloseBtn(heads[i])
                }
                // 处理给定元素及其子元素，连接任何htmx行为
                htmx.process(heads[i])
            }
            // 添加移动按钮
            if (mode === "scroll") {
                addMoveBtn(target)
            }
            // 绑定事件
            onTrigger(target, trigger)
            // 其他点击事件
            onClicks(target)
            // 默认
            if (bny.queryChild(target, ".head>li:nth-child(" + (index + 1) + ")")) {
                htmx.trigger(bny.queryChild(target, ".head>li:nth-child(" + (index + 1) + ")"), trigger)
            }
        }

        // 在htmx初始化节点后触发
        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, "bny-tab")) {
                tabInit(evt.target)
                return false
            }
            if (evt.target.tagName === "LI") {
                if (evt.target.parentElement.classList.contains("head")) {
                    const tab = evt.target.parentElement.parentElement
                    // 事件
                    const trigger = tab.getAttribute("hx-trigger") ?? "click";
                    evt.target.setAttribute("hx-trigger", trigger)
                    if (evt.target.getAttribute("closable") !== null &&
                        !bny.queryChild(evt.target, "i.icon-cuo")) {
                        addCloseBtn(evt.target)
                    }
                    const body = document.createElement("div")
                    const index = bny.indexOf(evt.target)
                    if (!bny.queryChild(tab, ".body>div:nth-child(" + (index + 1) + ")")) {
                        bny.queryChild(tab, ".body").appendChild(body)
                        // 处理给定元素及其子元素，连接任何htmx行为
                        htmx.process(body)
                    }
                    // 处理给定元素及其子元素，连接任何htmx行为
                    htmx.process(evt.target)
                    return false
                }
            }
        }
        // 在交换前触发，允许你配置交换
        if (name === "htmx:beforeSwap") {
            if (evt.target.tagName === "LI") {
                if (evt.target.parentElement.classList.contains("head")) {
                    const liSwap = function (evt) {
                        const tab = evt.target.parentElement.parentElement
                        const html = evt.detail.xhr.responseText
                        const index = bny.indexOf(evt.target)
                        htmx.swap(bny.queryChild(tab, ".body>div:nth-child(" + (index + 1) + ")"),
                            html,
                            {
                                swapStyle: "innerHTML"
                            })
                    }
                    liSwap(evt)
                    return false
                }
            }
        }
        return true
    },
    // 响应转换
    transformResponse: function (text, xhr, elt) {

        return text
    }
})