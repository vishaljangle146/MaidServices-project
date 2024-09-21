// Restrict input to numeric characters only
document.addEventListener('DOMContentLoaded', function() {
    var input = document.querySelector('.passInput');
    input.addEventListener('input', function(event) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});
