let user = localStorage.getItem('user');
if (user) {
    user = JSON.parse(user);
    signIn(user);
} else {
    screen('signin');
}



if (navigator.credentials && navigator.credentials.preventSilentAccess) {
    (async () => {
        if (user) return;

        const credentials = await navigator.credentials.get({
            password: true,
            federated: {
                providers: [
                    'https://accounts.google.com',
                    'https://facebook.com'
                ]
            }
        });
        if (credentials) {
            if (credentials.type === 'password') {
                signIn(credentials);
            } else if (credentials.type === 'federated'
            && credentials.provider === 'https://accounts.google.com') {
                signInWithGoogle(credentials);
            } else if (credentials.type === 'federated'
            && credentials.provider === 'https://facebook.com') {
                signInWithFacebook(credentials);
            }
        }

    })();
}



$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    const credentials = new PasswordCredential({
        id: email,
        name: name,
        password: password
    });
    signIn(credentials);

    form.name.value = '';
    form.email.value = '';
    form.password.value = '';
});

$('.profile a').addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
});

function handleGoogleSignIn(user) {
    const profile = user.getBasicProfile();
    const credentials = new FederatedCredential({
        id: profile.getEmail(),
        name: profile.getName(),
        iconURL: profile.getImageUrl(),
        provider: 'https://accounts.google.com'
    });
    signIn(credentials);
}

function handleFacebookSignIn() {
    FB.api('/me?fields=name,email,picture', (profile) => {
        const credentials = new FederatedCredential({
            id: profile.email,
            name: profile.name,
            iconURL: profile.picture.data.url,
            provider: 'https://facebook.com'
        });
        signIn(credentials);
    });
}

async function signIn(credentials) {
    $('.profile img').src = credentials.iconURL || 'avatar.png';
    $('.profile h3').textContent = credentials.name || '';
    $('.profile p').textContent = credentials.id || '';

    user = only(credentials, ['id', 'name', 'password', 'iconURL', 'provider']);
    localStorage.setItem('user', JSON.stringify(user));
    screen('profile');

    if (credentials instanceof Credential) {
        await navigator.credentials.store(credentials);
    }
}

async function signInWithGoogle(credentials) {
    const auth = gapi.auth2.getAuthInstance();
    if (auth.isSignedIn.get()) {
        const user = auth.currentUser.get();
        if (user.getBasicProfile().getEmail() === credentials.id) {
            return handleGoogleSignIn(user);
        }
    }
    const user = await auth.signIn({ login_hint: credentials.id });
    handleGoogleSignIn(user);
}

async function signInWithFacebook(credentials) {
    FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
            return handleFacebookSignIn();
        }
        FB.login(handleFacebookSignIn);
    });
}

async function signOut() {
    switch (user.provider) {
        case 'https://accounts.google.com':
            await signOutWithGoogle();
            break;
        case 'https://facebook.com':
            await signOutWithFacebook();
            break;
    }

    localStorage.removeItem('user');
    screen('signin');

    await navigator.credentials.preventSilentAccess();
}

async function signOutWithGoogle() {
    const auth = gapi.auth2.getAuthInstance();
    await auth.signOut();
}

function signOutWithFacebook() {
    FB.logout();
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
