htmx.defineExtension('bny-tab', {
    onEvent: function (name, evt) {

        /**
         * 添加移动按钮
         * @param {HTMLElement} target 头元素
         * @returns {void}
         */
        function addMoveBtn(target) {
            // 添加滚动条
            const head = target.querySelector(".head")
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
                    let lis = target.querySelectorAll(".head>li")
                    // 获取所有的 body 元素
                    let bodys = target.querySelectorAll(".body>div")
                    let index = bny.indexOf(li)
                    // 切换标签
                    bny.removeClass(lis, "this")
                    bny.removeClass(bodys, "show")
                    htmx.addClass(lis[index], "this")
                    htmx.addClass(bodys[index], "show")
                }
            }

            // 使用事件委托的方式监听事件
            if (trigger === "hover") {
                // 对于 hover 事件，使用 mouseover（会冒泡，支持事件委托）
                target.addEventListener("mouseover", function (e) {
                    const li = e.target.closest(".head>li")
                    switchTab(li)
                })
            } else {
                // 对于其他事件类型，直接添加监听器
                target.addEventListener(trigger, function (e) {
                    const li = e.target.closest(".head>li")
                    switchTab(li)
                })
            }
        }

        // 其他点击事件
        function onClicks(target) {
            target.addEventListener("click", (e) => {
                // 点击删除标签
                const closeBtn = e.target.closest("li>i.icon-cuo")
                if (closeBtn) {
                    const index = bny.indexOf(closeBtn.parentElement)
                    const li = target.querySelector(".head>li:nth-child(" + (index + 1) + ")")
                    const body = target.querySelector(".body>div:nth-child(" + (index + 1) + ")")
                    // 删除标签
                    li.remove()
                    body.remove()
                    // 切换下一个标签
                    if (li.classList.contains("this")) {
                        const nextLi = target.querySelector(".head>li")
                        if (!nextLi) {
                            return
                        }
                        const nextIndex = bny.indexOf(nextLi)
                        const nextBody = target.querySelector(".body>div:nth-child(" + (nextIndex + 1) + ")")
                        htmx.addClass(nextLi, "this")
                        htmx.addClass(nextBody, "show")
                    }
                    e.stopPropagation()
                }
                // 点击左滑动
                const leftBtn = e.target.closest("div.btn-left")
                if (leftBtn) {
                    const head = target.querySelector(".head")
                    head.scrollLeft -= 100
                }
                // 点击右滑动
                const rightBtn = e.target.closest("div.btn-right")
                if (rightBtn) {
                    const head = target.querySelector(".head")
                    head.scrollLeft += 100
                }
            })
        }
        /// 在htmx初始化节点后触发
        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, "bny-tab")) {
                const heads = evt.target.querySelectorAll(".head>li");
                const bodys = evt.target.querySelectorAll(".body>div");
                // 事件
                const trigger = evt.target.getAttribute("hx-trigger") ?? "click";
                // 模式
                const mode = evt.target.getAttribute("mode") ?? "normal"
                for (let i = 0; i < heads.length; i++) {
                    if (heads[i].getAttribute("closable") !== null) {
                        addCloseBtn(heads[i])
                    }
                }
                // 补全body
                const addBody = heads.length - bodys.length
                for (let i = 0; i < addBody; i++) {
                    const body = document.createElement("div")
                    bodys[0].parentNode.appendChild(body)
                }
                // 添加移动按钮
                if (mode === "scroll") {
                    addMoveBtn(evt.target)
                }
                // 绑定事件
                onTrigger(evt.target, trigger)
                // 其他点击事件
                onClicks(evt.target)
            }
        }
        return true
    },
    // 响应转换
    transformResponse: function (text, xhr, elt) {

        return text
    }
})