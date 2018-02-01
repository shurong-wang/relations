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

    screenfull.on('change', function () {
        var screenElem = screenfull.element;
        if(screenfull.isFullscreen) {
            $('#fullScreen').addClass('hidden');
            $('#exitScreen').removeClass('hidden');
        }
        else {
            $('#fullScreen').removeClass('hidden');
            $('#exitScreen').addClass('hidden');
        }
    });

});