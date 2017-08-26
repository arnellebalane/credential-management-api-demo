const user = localStorage.getItem('user');
if (user) {
    signIn(JSON.parse(user));
} else {
    screen('signin');
}



if (navigator.credentials && navigator.credentials.preventSilentAccess) {
    (async () => {
        if (user) return;

        const credentials = await navigator.credentials.get({
            password: true
        });
        if (credentials) {
            signIn(credentials);
        }

    })();
}



$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    const credentials = new PasswordCredential({
        id: username,
        password: password
    });
    signIn(credentials);

    form.username.value = '';
    form.password.value = '';
});

$('.profile a').addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
});

async function signIn(credentials) {
    $('.profile img').src = credentials.iconURL || 'avatar.png';
    $('.profile h3').textContent = credentials.name || '';
    $('.profile p').textContent = credentials.id || '';

    const user = only(credentials, ['id', 'name', 'password', 'iconURL']);
    localStorage.setItem('user', JSON.stringify(user));
    screen('profile');

    if (credentials instanceof Credential) {
        await navigator.credentials.store(credentials);
    }
}

async function signOut() {
    localStorage.removeItem('user');
    screen('signin');

    await navigator.credentials.preventSilentAccess();
}

function $(selector, context = document) {
    return context.querySelector(selector);
}

function only(object, keys) {
    return keys.reduce((filtered, key) => (
        Object.assign(filtered, { [key]: object[key] })
    ), {});
}

function screen(name) {
    $(`section[id="${name}"]`).classList.remove('hidden');
    $(`section:not([id="${name}"])`).classList.add('hidden');
}
