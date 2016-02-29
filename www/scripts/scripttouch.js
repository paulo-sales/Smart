
$(window).load(function () {

    $("#sidebar-toggle").click(function () {

        var toggle_el = $(this).data("toggle");
        $(toggle_el).addClass("open-sidebar");
        $(".swipe-area").addClass("open");
    });
    $(".swipe-area").swipe({
        swipeStatus: function (event, phase, direction, distance, duration, fingers) {
            if (phase == "move" && direction == "right") {
                $("#sidebar").addClass("open-sidebar");
                $(this).addClass("open");
                return false;
            }
            if (phase == "move" && direction == "left") {
                $("#sidebar").removeClass("open-sidebar");
                $(this).removeClass("open");
                return false;
            }
        }
    });

    $("#page").swipe({
        swipeStatus: function (event, phase, direction, distance, duration, fingers) {

            if (phase == "move" && direction == "left") {
                $("#sidebar").removeClass("open-sidebar");
                return false;
            }
        }
    });

});

function closeMenu() {
    $("#sidebar").removeClass("open-sidebar");
}
