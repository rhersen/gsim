function init() {
    var canvasEl = document.getElementById("canvas");
    scene.init(canvasEl);

    function canvasResize() {
        var container = $('#container');
        var left = $('#left');
        var content = $('#content');
        console.log("left.width()=",left.width(),"left.innerWidth()=",left.innerWidth(),"left.outerWidth()=",left.outerWidth());
        $('#canvas').width(container.width() - left.outerWidth(true) - 24);
        $('#canvas').height($(window).height() - 24);
//					$('#left').height($(window).height() - 54);
        scene.setSizes();
    }

    canvasResize();

    $(window).bind("resize", function(){
        canvasResize();
    });

    $(function () {
        $("#left").resizable({
            handles: 'e',
            minWidth: '50',
            maxWidth: '350',
            resize: function() {
                canvasResize();
            }
        });
    });
}