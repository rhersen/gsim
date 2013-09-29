function init() {
    var canvas = $('#canvas');
    scene.init(canvas.get(0));

    function canvasResize() {
        var left = $('#left');
        console.log("left.width()=", left.width(), "left.innerWidth()=", left.innerWidth(), "left.outerWidth()=", left.outerWidth());
        canvas.width($('#container').width() - left.outerWidth(true) - 24);
        canvas.height($(window).height() - 24);
        scene.setSizes();
    }

    canvasResize();

    $(window).bind("resize", canvasResize);

    $("#left").resizable({
        handles: 'e',
        minWidth: '50',
        maxWidth: '350'
    });
}