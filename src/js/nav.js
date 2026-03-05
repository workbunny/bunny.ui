htmx.defineExtension('bny-nav', {
    onEvent: function (name, evt) {

        function onToggle(btn, nav) {
            btn.addEventListener('click', (e) => {
                const collapsed = nav.hasAttribute('collapsed') ?? false
                if (collapsed) {
                    nav.removeAttribute('collapsed')
                } else {
                    nav.setAttribute('collapsed', '')
                }
                const isShow = nav.querySelectorAll('li.show')
                if (isShow.length > 0) {
                    bny.removeClass(isShow, 'show')
                }
            })
        }


        if (name === 'htmx:afterProcessNode') {
            if (bny.hasExtName(evt.target, 'bny-nav')) {

                const collapsed = evt.target.hasAttribute('collapsed') ?? false
                const toggle = evt.target.hasAttribute('toggle')
                if (toggle) {
                    const head = bny.queryChild(evt.target, '.head')
                    const toggleBtn = document.createElement('div')
                    toggleBtn.classList.add('toggle-btn')
                    toggleBtn.innerHTML = '<i class="bny-icon icon-doubleleft"></i>'
                    head.appendChild(toggleBtn)
                    onToggle(toggleBtn, evt.target)
                }

                evt.target.addEventListener('click', function (e) {
                    const item = e.target.closest('li')
                    let subMenu = item?.querySelector('.sub-menu') ?? false
                    if (item && subMenu) {
                        item.classList.toggle('show')
                    }
                })


                return false
            }
        }
    }
})