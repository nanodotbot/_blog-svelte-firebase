<script>
    import {
        fireName
    } from "../stores/firestore";
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
        onSnapshot,
        deleteDoc,
        where,
        query
    } from "firebase/firestore";
    import { onMount } from 'svelte';

    const db = getFirestore();
    const cllctn = collection(db, 'posts');
    const cllctnC = collection(db, 'comments');
    const cllctnU = collection(db, 'users');

    let currentUser;
    let feedback = '';
    let open = false;
    let posts = [];
    let comments = [];
    let userU = [];

    const openDelete = () => {
        open = true;
    }

    const deletePosts = () => {
        posts.forEach(post => {
            console.log(post);
            let dcmnt = doc(cllctn, post);
            deleteDoc(dcmnt)
                .then(() => console.log('deleted doc:', post.id))
        });
    }
    const deleteComments = () => {
        comments.forEach(comment => {
            console.log(comment);
            let dcmnt = doc(cllctnC, comment);
            deleteDoc(dcmnt)
                .then(() => console.log('deleted doc:', comment.id))
        });
    }
    const deleteUserC = () => {
        userU.forEach(user => {
            console.log(user);
            let dcmnt = doc(cllctnU, user);
            deleteDoc(dcmnt)
                .then(() => console.log('deleted doc:', user.id))
        });
    }
    const deleteCurrentUser = () => {
        console.log('here i am');
        deleteUser(auth.currentUser).then(() => {
            console.log('user deleted');
        }).catch(error => {  
            console.log(error);
        });
    }

    const handleDelete = () => {
        // console.log(currentUser);
        console.log('handleDelete');
        deletePosts();
        deleteComments();
        deleteCurrentUser();
        deleteUserC();
    }
    const handleRefusal = () => {
        open = false;
    }
    onMount(() => {
        currentUser = localStorage.getItem('uid');
        console.log('delete-onMount:', currentUser);
        let qry = query(cllctn, where('uid', '==', currentUser));
        let qryC = query(cllctnC, where('uid', '==', currentUser));
        let qryU = query(cllctnU, where('uid', '==', currentUser));
        onSnapshot(qry, snapshot => {
            let firePosts = [];
            snapshot.forEach(doc => {
                let post = {id: doc.id, ...doc.data()};
                firePosts = [post, ...firePosts];
            });
            firePosts.forEach(firePost => {
                posts.push(firePost.id);
            });
            // console.log('firePosts', firePosts);
            // console.log('posts', posts);
            // console.log('end of snapshot');
        });
        onSnapshot(qryC, snapshot => {
            let fireComments = [];
            snapshot.forEach(doc => {
                let comment = {id: doc.id, ...doc.data()};
                fireComments = [comment, ...fireComments];
            });
            fireComments.forEach(fireComment => {
                comments.push(fireComment.id);
            });
            // console.log('fireComments', fireComments);
            // console.log('comments', comments);
            // console.log('end of snapshot');
        });
        onSnapshot(qryU, snapshot => {
            let fireUser = [];
            snapshot.forEach(doc => {
                let user = {id: doc.id, ...doc.data()};
                fireUser = [user, ...fireUser];
            });
            fireUser.forEach(fireUser => {
                userU.push(fireUser.id);
            });
            // console.log('fireUser', fireUser);
            // console.log('comments', comments);
            // console.log('end of snapshot');
        });
    });

</script>

<svelte:head>
    <title>Löschen</title> 
</svelte:head>

{#if fireName}
    {#if open}
        <div class="wrapper delete">
            <div class="content">
                <h3>Account löschen</h3>
                <p>Möchtest du deinen Acount wirklich löschen? Damit werden erst alle deine Posts und Kommentare gelöscht, danach dein Zugang.<br><br>Damit das Löschen des Accounts funktioniert, ist es notwendig, dass du dich kürzlich angemeldet hast, d. h., du solltest dich vor diesem Schritt sicherheitshalber ab- und wieder anmelden.</p>
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
        color: var(--black);
        background-color: var(--split-complementary-1);
        border: .1rem solid var(--black);
    }
    button.delete:hover {
        color: var(--black);
        background-color: var(--split-complementary-1-lighter);
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