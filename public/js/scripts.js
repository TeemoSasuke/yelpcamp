
document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // 获取 flash message 容器和 flash message 元素
    var flashMessageContainer = document.getElementById('flash-message-container');
    var flashMessage = document.getElementById('flash-message');

    // 只有当 flash message 存在时才添加事件监听
    if (flashMessage) {
        document.addEventListener('click', function(event) {
            // 如果点击的不是 flash message 或其关闭按钮，隐藏 flash message
            if (!flashMessage.contains(event.target)) {
                flashMessage.style.display = 'none';
            }
        });
    }
});