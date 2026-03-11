htmx.defineExtension('bny-anchor', {
    // 事件
    onEvent: function (name, evt) {

        function moveSilder(target, link) {
            const slider = bny.queryChild(target, ".slider")
            if (slider) {
                slider.style.top = link.offsetTop + "px"
            }
            link.classList.add("active")
        }

        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, "bny-anchor")) {
                const rail = evt.target.getAttribute("rail") !== null ? true : false
                if (rail) {
                    const slider = document.createElement("div")
                    slider.classList.add("slider")
                    evt.target.appendChild(slider)
                }

                // 点击导航
                evt.target.addEventListener("click", function (e) {
                    const link = e.target.closest(".link")
                    if (link) {
                        bny.removeClass(evt.target.querySelectorAll(".link"), "active")
                        const anchor = link.getAttribute("anchor")
                        const section = htmx.find(anchor)
                        if (section) {
                            section.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            })
                        }
                        moveSilder(evt.target, link)
                    }
                });

                // 鼠标悬浮也跟随
                evt.target.addEventListener("mouseover", function (e) {
                    const link = e.target.closest(".link")
                    if (link) {
                        bny.removeClass(evt.target.querySelectorAll(".link"), "active")
                        moveSilder(evt.target, link)
                    }
                })

                // 滚动自带跟随
                window.addEventListener("scroll", () => {
                    const links = evt.target.querySelectorAll(".link")
                    let currentLink = null
                    
                    links.forEach(link => {
                        const anchor = link.getAttribute("anchor")
                        const section = htmx.find(anchor)
                        if (section) {
                            const rect = section.getBoundingClientRect()
                            if (rect.top <= 100 && rect.bottom >= 100) {
                                currentLink = link
                            }
                        }
                    })
                    
                    if (currentLink) {
                        bny.removeClass(links, "active")
                        moveSilder(evt.target, currentLink)
                    }
                })

                return false;
            }
        }
    }
})