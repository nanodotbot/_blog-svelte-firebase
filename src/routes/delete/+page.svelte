<script>
    import { loggedIn } from "../stores/firestore";
    import {
        auth
    } from "../../lib/firebase";
    import {
        deleteUser,
        reauthenticateWithPopup,
        GoogleAuthProvider
    } from "firebase/auth";
    import {
        getFirestore,
        collection,
        doc,
        getDocs,
        deleteDoc,
        where,
        query
    } from "firebase/firestore";

    const currentUID = localStorage.getItem('uid');
    let feedback = '';
    let open = false;

    const openDelete = () => {
        open = true;
    }

    const googleProvider = new GoogleAuthProvider();
    const reauthWithGoogle = () => {
        return reauthenticateWithPopup(auth, googleProvider);
    }

    const db = getFirestore();
    const cllctn = collection(db, 'posts');
    const cllctnC = collection(db, 'comments');
    let posts = [];

    const handleDelete = () => {
        let user = auth.currentUser;
        console.log(user);

        const qry = query(cllctn, where('uid', '=', currentUID));
        console.log(qry);


        getDocs(qry)
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    posts.push({ id: doc.id, ...doc.data() });
                })
                console.log(posts);
            })
            .catch(err => console.log(err));


        // deleteUser(user).then(() => {
        //     console.log('user deleted');
        // }).catch(error => {  
        //     console.log(error);
        // });
    }
    const handleRefusal = () => {
        open = false;
    }
</script>

{#if loggedIn}
    {#if open}
        <div class="wrapper delete">
            <div class="content">
                <h3>Account löschen</h3>
                <p>Möchtest du deinen Acount wirklich löschen? Deine Zugangsdaten und alle deine Posts werden gelöscht. Der Schritt ist unumkehrbar.</p>
                <button class="delete" on:click|preventDefault={handleDelete}>Ja, endgültig löschen</button>
                <button on:click={handleRefusal}>Nein, lass mal bleiben</button>
            </div>
        </div>
    {:else}
        <div class="wrapper">
            <div class="content">
                <h3>Account löschen</h3>
                <button class="delete" on:click|preventDefault={openDelete}>Löschen</button>
                <p class="feedback">{feedback}</p>
                <a class="navigation" href="./">zurück zum Blog</a>
            </div>
        </div>
    {/if}
{/if}

<style>
    h3 {
        text-align: center;
    }
    div.wrapper {
        width: 100vw;
        max-width: 700px;
        height: 100vh;

        margin-right: auto;
        margin-left: auto;

        display: grid;
        align-content: center;
        justify-content: center;
    }
    div.content {
        width: 100vw;
        max-width: 700px;
        padding: 0 .3rem;
    }
    button {
        width: 100%;
        margin-top: 2rem;
    }
    button.delete {
        color: var(--warning);
        border: .1rem solid var(--warning);
    }
    button.delete:hover {
        color: var(--split-complementary-1-lighter);
        border: .1rem solid var(--split-complementary-1-lighter);
    }
    p.feedback {
        height: 2rem;
        margin-left: auto;
        margin-right: auto;
    }
    a.navigation {
        font-size: var(--font-size-small);
    }
</style>