const textareas = document.querySelectorAll('textarea');

textareas.forEach(textarea => {
    textarea.oninput = () => {
        textarea.style.height = ''; // reset  height
        textarea.style.height = textarea.scrollHeight + 1 + "px";
    }
});