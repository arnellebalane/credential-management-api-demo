$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    signIn(username, password);

    form.username.value = '';
    form.password.value = '';
});

$('.profile a').addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
});

function signIn(username, password) {
    $('.profile h3').textContent = '';
    $('.profile p').textContent = username;

    screen('profile');
}

function signOut() {
    screen('signin');
}

function $(selector, context = document) {
    return context.querySelector(selector);
}

function screen(name) {
    $(`section[id="${name}"]`).classList.remove('hidden');
    $(`section:not([id="${name}"])`).classList.add('hidden');
}
