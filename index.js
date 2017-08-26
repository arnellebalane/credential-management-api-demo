$('form').addEventListener('submit', (e) => {
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
});

function $(selector, context = document) {
    return context.querySelector(selector);
}
