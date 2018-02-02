$(function () {
    /**
     * 全屏切换
     */
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

    /* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

    /**
     * 导入数据
     */
    var $importItem = $('#import dl');
    $importItem.one('click', 'button', function () {
        $(this).addClass('disabled');
        var id = $(this).parents('dl').attr('id');
        var $describe = $('#' + id).find('small');
        var $progress = $('#' + id).find('.progress');
        $describe.addClass('hidden');
        $progress.removeClass('hidden');

        var start = 0;
        var rate = .61;
        var end = 100;
        var progress = start;
        var text = '0%';

        var step = function () {
            progress += rate;
            progress = Math.min(Math.round(progress * 10) / 10, 100.0);
            text = progress === 100.0 ? 'Complete' : progress + '%';
            $progress.find('.progress-bar').width(progress + '%');
            $progress.find('.progress-bar span').text(text);
            if (progress < 100) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    });


    /* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

    /**
     * 渲染图形
    */
    // 获取数据 && 绘制时间轴
    function getTimeLine(event) {
        cleanUpCanvas();
        fetchTimeLine(1);
    }

    getTimeLine(event);
});