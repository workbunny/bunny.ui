htmx.defineExtension('bny-table', {
    onEvent: function (name, evt) {
        if (name === "htmx:afterProcessNode") {
            if (bny.hasExtName(evt.target, "bny-table")) {
                let titles = [];
                let ths = evt.target.querySelectorAll("th");
                for (let th of ths) {
                    titles.push(th.textContent)
                }
                const tbody_trs = evt.target.querySelectorAll("tbody tr")
                for (let tr of tbody_trs) {
                    let tds = tr.querySelectorAll("td");
                    for (let td of tds) {
                        td.setAttribute("label", titles[td.cellIndex]);
                    }
                }
            } else if (evt.target.tagName === "TR") {
                let tds = evt.target.querySelectorAll("td");
                for (let td of tds) {
                    let label = evt.target
                        .parentElement
                        .parentElement
                        .querySelector(`th:nth-child(${td.cellIndex + 1})`)
                        .textContent
                    td.setAttribute("label", label);
                }
            }
        }
        return true
    }
})