document.addEventListener("DOMContentLoaded", function(){

    // listen for auth status changes
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("user logged in");

            setupUI(user);
        } else {
            console.log("user logged out");
            setupUI();
        }
    });

    // login
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // get user info
        const email = loginForm['input-email'].value;
        const password = loginForm['input-password'].value;
        // log the user in
        auth.signInWithEmailAndPassword(email, password).then((cred) => {
            // close the login modal & reset form
            loginForm.reset();

        })
        .catch((error) =>{
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById("error-message").textContent = errorMessage;
            console.log(errorMessage);
        });
    });

    // logout
    const logout = document.querySelector('#logout-link');
    logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
    });

    //register
    const registerForm = document.querySelector('#register-form');
    if (!registerForm) return;
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // get user info

        const email = registerForm['input-register-email'].value;
        const password = registerForm['register-password'].value;
        if (password !== registerForm['confirm-password'].value) {
            document.getElementById('registration-error-message').textContent = 'Passwords must match.';
            return;
        }
        // log the user in
        auth.createUserWithEmailAndPassword(email, password).then((cred) => {
            // close the register modal & reset form
            registerForm.reset();
            console.log("User registered successfully!");
        })
        .catch((error) =>{
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById("registration-error-message").textContent = errorMessage;
            console.log(errorMessage);
        });

    });
    
});