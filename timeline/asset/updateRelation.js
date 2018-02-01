$(function () {
    if (!screenfull.enabled) {
        console.error('您的浏览器不支持全屏操作');
        return false;
    }

    $('#fullScreen').on('click', function () {
        screenfull.request(document.querySelector('#main'));
    });

    $('#exitScreen').on('click', function () {
        screenfull.exit();
    });

    var oriWidth = $('#relation').width();
    var oriHeight = $('#relation').height();

    screenfull.on('change', function () {
        var screenElem = screenfull.element;
        if (screenfull.isFullscreen) {
            $('#fullScreen').addClass('hidden');
            $('#exitScreen').removeClass('hidden');
            var width = $('#relation').width();
            var height = $('#relation').height();
            $('#relation').find('svg, rect')
                .attr("width", width)
                .attr("height", height);
            $('#timeline')
                .css("width", width);
        }
        else {
            $('#fullScreen').removeClass('hidden');
            $('#exitScreen').addClass('hidden');
            $('#relation').find('svg, rect')
                .attr("width", oriWidth)
                .attr("height", oriHeight);
            $('#timeline')
                .css("width", oriWidth);
        }
    });

    // 获取数据 && 绘制时间轴
    function getTimeLine(event) {
        cleanUpCanvas();
        fetchTimeLine(1);
    }


    getTimeLine(event);
});