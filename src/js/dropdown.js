htmx.defineExtension('bny-dropdown', {
    // 事件
    onEvent: function (name, evt) {

        /**
         * 设置下拉菜单的位置
         * 
         * @param {HTMLElement} trigger 触发组件
         * @param {HTMLElement} menu 菜单组件
         * @returns {void}
         */
        function setPosition(trigger, menu) {
            // 获取触发按钮的屏幕位置和尺寸
            const triggerRect = trigger.getBoundingClientRect();
            // 获取窗口尺寸
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // 先隐藏菜单（避免计算尺寸时受当前位置影响）
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';

            // 临时显示菜单以获取其真实尺寸（不可见状态）
            menu.style.display = 'block';
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;
            menu.style.display = '';

            // ========== 计算最佳位置 ==========
            let top, left;

            // 1. 垂直方向判断：优先显示在按钮下方，若超出屏幕则显示在上方
            if (triggerRect.bottom + menuHeight <= windowHeight) {
                // 下方有足够空间：菜单顶部 = 按钮底部
                top = triggerRect.bottom + window.scrollY;
            } else {
                // 下方空间不足：菜单底部 = 按钮顶部
                top = triggerRect.top - menuHeight + window.scrollY;
            }

            // 2. 水平方向判断：优先显示在按钮左侧对齐，若超出屏幕则右对齐
            if (triggerRect.left + menuWidth <= windowWidth) {
                // 右侧有足够空间：菜单左侧 = 按钮左侧
                left = triggerRect.left + window.scrollX;
            } else {
                // 右侧空间不足：菜单右侧 = 按钮右侧
                left = triggerRect.right - menuWidth + window.scrollX;
            }

            // 设置菜单的固定位置
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;

            // 恢复菜单可见性
            menu.style.opacity = '';
            menu.style.visibility = '';
        }

        // 在htmx初始化节点后触发
        if (name === 'htmx:afterProcessNode') {
            if (bny.hasExtName(evt.target, 'bny-dropdown')) {
                evt.target.style.transform = "none"
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
                    setPosition(evt.target, dropdown)
                }
                return false
            }
        }
        return true
    }
})