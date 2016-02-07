$('document').ready(function () {
    ($("#keyboard-message-input").keypress(function (e) {
        if (e.keyCode == 13 && e.shiftKey) {
            e.preventDefault();
            $('#keyboard-send').click();
        }
    })); // Sending (Shift+Enter)
});
