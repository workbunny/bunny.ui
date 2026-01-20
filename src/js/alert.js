htmx.defineExtension('bny-alert', {
    // 响应转换
    transformResponse: function (text, xhr, elt) {

        if (xhr.getResponseHeader('Content-Type')
            .includes('application/json')) {
            // 解析JSON响应
            const data = JSON.parse(xhr.responseText)
            bny.alert(data.msg, data.color, data.anim, data.time)
            return elt.innerHTML
        }
    }
})