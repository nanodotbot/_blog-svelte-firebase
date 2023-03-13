<script>
    import '../main.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth } from '../lib/firebase';
    import { fireName, loggedIn } from './stores/firestore';
    import { onAuthStateChanged } from 'firebase/auth';
    import {
        getFirestore,
        collection,
        onSnapshot,
        query,
        where
    } from 'firebase/firestore';


    onMount(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                console.log('onAuthStateChanged onMount: user given, loggedIn.update true');
                loggedIn.update(() => true);
                const db = getFirestore();
                const cllctn = collection(db, 'users');
                const qry = query(cllctn, where('uid', '==', user.uid));
                let username;
                onSnapshot(qry, snapshot => {
                    snapshot.docs.forEach(doc => {
                        username = doc.data().username;
                        fireName.update(() => username);
                    })
                });

                
            } else {
                console.log('onAuthStateChanged onMount: no user, loggedIn.update false');
                loggedIn.update(() => false);
                goto('/login');
            }
        })
    });

</script>

<slot/>