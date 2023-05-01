<script>
    import { goto } from '$app/navigation';
    import { auth } from "../../lib/firebase";
    import {
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        sendPasswordResetEmail
    } from "firebase/auth";
    import {
        getFirestore,
        collection,
        addDoc,
        serverTimestamp
    } from 'firebase/firestore';
    
    import { onMount } from 'svelte';
    import { loggedIn } from '../stores/firestore';

    let mail = '';
    let username = '';
    let password = '';
    let register = false;
    let feedback = '';

    const handleSwitch = () => {
        register = register ? false : true;
        feedback = '';
    }

    const handleLogin = () => {
        console.log(password);
        signInWithEmailAndPassword(auth, mail, password)
        .then(cred => {
            const user = cred.user;
            // console.log('user logged in:', user);
            localStorage.setItem('uid', user.uid);
            goto('/');
        })
        .catch(err => {
            switch(err.code) {
                case 'auth/invalid-email':
                    feedback = 'Falsche Mailadresse oder Passwort';
                    break;
                case 'auth/wrong-password':
                    feedback = 'Falsche Mailadresse oder Passwort';
                    break;
                default:
                    feedback = 'Bitte Eingaben überprüfen';
                    console.log(err.code);
            }
        })
    };

    const createUserAccount = uid => {
        const db = getFirestore();
        const cllctn = collection(db, 'users');
        addDoc(cllctn, {
            uid: uid,
            username: username,
            createdAt: serverTimestamp()
        })
        console.log('user created');
    };

    // const handleRegister = () => {
    //     if(mail && password && username) {
    //         createUserWithEmailAndPassword(auth, mail, password)
    //         .then(cred => {
    //             // console.log('user created', cred.user);
    //             // console.log('uid', cred.user.uid);
    //             createUserAccount(cred.user.uid);
    //             mail = '';
    //             password = '';
    //             username = '';
    //             console.log('end of register');
    //         })
    //         .catch(err => {
    //             switch(err.code) {
    //                 case 'auth/invalid-email':
    //                     feedback = 'Ungültige Mailadresse';
    //                     break;
    //                 case 'auth/invalid-email':
    //                     feedback = 'Ungültiges Passwort ';
    //                     break;
    //                 case 'auth/weak-password':
    //                     feedback = 'Passwort muss mindestens sechs Zeichen lang sein';
    //                     break;
    //                 case 'auth/email-already-in-use':
    //                     feedback = 'E-Mail-Adresse bereits vergeben';
    //                     break;
    //                 default:
    //                     feedback = 'Bitte Eingaben überprüfen';
    //                     console.log(err.code);
    //             }
    //         })
    //     } else {
    //         feedback = 'Bitte Angaben vervollständigen';
    //     }
    // }

    const handleReset = () => {
        if (!mail) {
            feedback = 'Bitte Mailadresse eingeben';
            return;
        }
        sendPasswordResetEmail(auth, mail)
            .then(() => {
                feedback = 'Mail zum Zurücksetzen des Passworts versendet';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
    }

    onMount(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                console.log('onAuthStateChanged: loggedIn');
                // console.log('onAuthStateChanged: loggedIn', user);
                loggedIn.update(() => true);
                // console.log('user-uid-onauthstatechanged', user.uid);
                localStorage.setItem('uid', user.uid);
                goto('/');
            } else {
                console.log('onAuthStateChanged: loggedOut');
                loggedIn.update(() => false);
                goto('/login');
            }
        })
    });
</script>

<svelte:head>
    <title>Login</title> 
</svelte:head>

{#if !register}

    <div class="form-wrapper">
        <h3>Einloggen</h3>
        <form>
            <div>
                <label for="mail">Mailadresse</label>
                <input type="text" name="mail" bind:value={mail} autofocus>
            </div>
            <div>
                <label for="password">Passwort</label>
                <input type="password" name="password" bind:value={password}>
            </div>
            <button on:click|preventDefault={handleLogin}>Anmelden</button>
        </form>
        <p class="feedback">{feedback}</p>
        <!-- <p class="hint hint-1">Noch keinen Account? <button class="inlineBtn" on:click={handleSwitch}>Registrieren</button></p> -->
        <p class="hint">Passwort vergessen? <button class="inlineBtn" on:click={handleReset}>Passwort zurücksetzen</button></p>
    </div>

{:else}

    <div class="form-wrapper">
        <!-- <h3>Registrieren</h3>
        <form>
            <div>
                <label for="mail">Mailadresse</label>
                <input type="text" name="mail" bind:value={mail} autofocus>
            </div>
            <div>
                <label for="mail">Nutzername</label>
                <input type="text" name="username" bind:value={username}>
            </div>
            <div>
                <label for="password">Passwort</label>
                <input type="password" name="password" bind:value={password}>
            </div>
            <button on:click|preventDefault={handleRegister}>Registrieren</button>
        </form>
        <p class="feedback">{feedback}</p>
        <p class="hint">Bereits einen Account? <button class="inlineBtn" on:click={handleSwitch}>Anmelden</button></p> -->
    </div>

{/if}


<style>
    h3 {
        text-align: center;
    }
    div.form-wrapper {
        width: 100vw;
        height: 100vh;

        display: grid;
        align-content: center;
        justify-content: center;
    }

    form {
        width: 700px;
        max-width: 98vw;

        padding-left: 1rem;
        padding-right: 1rem;
    }

    input, label, button {
        width: 100%;
    }
    p.feedback {
        height: 2rem;
    }
    p.hint {
        font-size: var(--font-size-small);
    }
    p.hint-1 {
        margin-bottom: 0rem;
    }
    button.inlineBtn {
        display: inline;
        width: auto;
        border: none;
        font-size: var(--font-size-small);

        color: var(--link-text);
        background-color: var(--background);
    }
    button.inlineBtn:hover {
        color: var(--link-hover-text);
        background-color: var(--link-hover-bg);
    }
</style>