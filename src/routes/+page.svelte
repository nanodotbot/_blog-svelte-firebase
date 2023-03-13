<script>
    import {
        loggedIn,
        fireName
    } from './stores/firestore';

    import {
        auth,
        app
    } from '../lib/firebase';
    import { signOut } from 'firebase/auth';
    import {
        getFirestore,
        collection,
        onSnapshot,
        doc,
        addDoc,
        deleteDoc,
        query,
        where,
        orderBy,
        serverTimestamp,
        getDocs,
        updateDoc
    } from 'firebase/firestore';
    import {
        getDownloadURL,
        getStorage,
        ref,
        uploadBytes
    } from 'firebase/storage';

	import { v4 as uuidv4 } from 'uuid';

    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    
    import Logout99e8d4 from '$lib/images/logout_FILL99e8d4_wght300_GRAD0_opsz24.svg';
    import Logoutc3f2e6 from '$lib/images/logout_FILLc3f2e6_wght300_GRAD0_opsz24.svg';
    import Add99e8d4 from '$lib/images/add_FILL99e8d4_wght300_GRAD0_opsz24.svg';
    import Addc3f2e6 from '$lib/images/add_FILLc3f2e6_wght300_GRAD0_opsz24.svg';
    import Deleteedbeae from '$lib/images/delete_FILLedbeae_wght300_GRAD0_opsz24.svg';
    import Deletef8e0de from '$lib/images/delete_FILLf8e0de_wght300_GRAD0_opsz24.svg';

    const logout = () => {
        signOut(auth)
        .then(() => {
            localStorage.removeItem('uid');
        })
        .catch(error => console.error(error))
    }

    let open = false;
    const openMenu = () => {
        open = open ? false : true;
    }

    let addSrc = Add99e8d4;
    const handleAddFocus = () => {
        addSrc = Addc3f2e6;
    }
    const handleAddBlur = () => {
        addSrc = Add99e8d4;
    }

    let logoutSrc = Logout99e8d4;
    const handleLogoutFocus = () => {
        logoutSrc = Logoutc3f2e6;
    }
    const handleLogoutBlur = () => {
        logoutSrc = Logout99e8d4;
    }

    let deleteSrc = Deleteedbeae;
    const handleDeleteFocus = () => {
        deleteSrc = Deletef8e0de;
    }
    const handleDeleteBlur = () => {
        deleteSrc = Deleteedbeae;
    }

    let preview = '';
    let border = '.1rem var(--link) dashed';
    let color = 'var(--link)';
    let height;
    
    let file;
    let message;
    let feedback = '';

    const handleFile = e => {
        console.log(file);
        const reader = new FileReader;
        if (file.type.startsWith('image/')) {
            reader.onload = e => {
                preview = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    }

    const handleChange = e => {
        file = e.target.files[0];
        handleFile(e);
    }

    const dragIn = () => {
        border = '.1rem var(--link-secondary) dashed';
        color = 'var(--link-secondary)';
    }
    const dragOut = () => {
        border = '.1rem var(--link) dashed';
        color = 'var(--link)';
    }

    const handleDrop = e => {
        file = e.dataTransfer.files[0];
        handleFile(e);
    }

    const handleInput = e => {
        height = '';
        height = e.target.scrollHeight + 1 + 'px';
        // console.log(e.target.scrollHeight);
        // why is scrollheight sticky?
    }

    const db = getFirestore();
    const cllctn = collection(db, 'posts');
    let currentUser;

    const storage = getStorage(app);

    const handleUpload = () => {
        if (!file || !message) {
            feedback = 'Nachricht und Bild sind ein Muss';
            return;
        }

        if (file && message && currentUser && fireName) {
            if(file.size > 1500000) {
                feedback = 'Die Dateigrösse darf 15 Megabyte nicht überschreiten';
                return;
            }
            const myUUID = uuidv4();

            const fileName = file.name + myUUID; // TODO: fix filename
            const imageRef = ref(storage, `images/${fileName}`);

            uploadBytes(imageRef, file).then(snapshot => {
                // feedback = `${file} -> ${imageRef}`;
                getDownloadURL(snapshot.ref).then(url => {
                    const uploadedImgURL = url;
                    // console.log(currentUser, fireName, uploadedImgURL, message);
                    addDoc(cllctn, {
                        uid: currentUser,
                        name: $fireName,
                        picture: uploadedImgURL,
                        message: message,
                        createdAt: serverTimestamp()
                    })
                        .then(() => {
                            console.log('success');
                            feedback = '';
                            preview = '';
                            message = '';
                        });
                        
                })
            })
        }
    };

    let posts = [];
    const qry = query(cllctn, orderBy('createdAt'));

    onSnapshot(qry, snapshot => {
        let firePosts = [];
        snapshot.forEach(doc => {
            let post = {id: doc.id, ...doc.data()};
            firePosts = [post, ...firePosts];
        });
        posts = firePosts;
        posts.forEach(post => {
            post.createdAt = new Date(post.createdAt.seconds * 1000).toLocaleString();
            // console.log(post.createdAt);
        });
    });

    const handleDelete = () => {
        console.log('here i am');
    }

    let comment = [];
    let unsichtbar = [];
    //https://stackoverflow.com/questions/57728657/problems-with-toggle-the-display-of-a-div-in-a-nested-svelte-each-block

    const handleUnsichtbar = (index) => {
        unsichtbar[index]=!unsichtbar[index];
    }

    let heights = [];
    const handleHeights = (e, index) => {
        heights[index ] = '';
        heights[index] = e.target.scrollHeight + 1 + 'px';
        // console.log(heights[index]);
        console.log(e.target.scrollHeight); // why does scrollheigt apply to all elements?
    }


    const cllctnC = collection(db, 'comments');
    const handleComment = (id, index) => {
        console.log(id);
        if (currentUser && fireName && comment[index] && id){
            addDoc(cllctnC, {
                uid: currentUser,
                postid: id,
                cname: $fireName,
                comment: comment[index],
                createdAt: serverTimestamp()
            })
            .then(() => {
                comment[index] = '';
                console.log('c posted');
            });
            return;
        }
    }

    let comments = [];
    let commentsFlattened = [];
    const qryC = query(cllctnC, orderBy('createdAt'));

    onSnapshot(qryC, snapshot => {
        let fireComments = [];
        snapshot.forEach(doc => {
            let comment = {id: doc.id, ...doc.data()};
            fireComments = [comment, ...fireComments];
        });
        // console.table(fireComments);
        comments = fireComments;
        // console.log(comments);
        comments.forEach(comment => {
            commentsFlattened.push(Object.entries(comment));
            commentsFlattened = commentsFlattened.flat(Infinity);
            comment.createdAt = new Date(comment.createdAt.seconds * 1000).toLocaleString();
            // console.log(comment.createdAt);
            // console.log(commentsFlattened);
        });
    });

    let modal = false;
    let bigImg = '';
    const openModal = (e) => {
        bigImg = e.target.src;
        console.log(e.target.src);
        modal = true;
    }
    const closeModal = () => {
        modal = false;
    }

    onMount(() => {
        currentUser = localStorage.getItem('uid');
        console.log('current user / uid from localStorage is:', currentUser);
    });
</script>

{#if currentUser}

    <header>

        <button id="menu-button" class={open ? 'open' : ''} on:click={openMenu}>
            <img src="{addSrc}" alt="add" on:mouseover={handleAddFocus} on:focus={handleAddFocus} on:mouseout={handleAddBlur} on:blur={handleAddBlur}>
        </button>

        <div class="side-options">

            <a href="./delete/" class="firename">{$fireName}</a>

            <button on:click={logout}>

                <img src={logoutSrc} alt="logout" on:mouseover={handleLogoutFocus} on:focus={handleLogoutFocus} on:mouseout={handleLogoutBlur} on:blur={handleLogoutBlur}>

            </button>

        </div>

    </header>

    <main>

        {#if open}

            <form transition:slide>

                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <div id="drop-area" style:border on:mouseover|preventDefault={dragIn} on:dragenter|preventDefault={dragIn} on:dragover|preventDefault={dragIn} on:mouseout|preventDefault={dragOut} on:dragleave|preventDefault={dragOut} on:drop|preventDefault={handleDrop}>

                    <label for="file" style:color>Bild wählen oder hierher ziehen</label>
                    <input type="file" name="file" id="file" accept="image/*" on:change={handleChange}>

                </div>

                {#if preview}

                    <img src={preview} alt="preview">

                {/if}

                <div>

                    <label for="message">Deine Nachricht</label>
                    <textarea name="message" id="message" bind:value={message} style:height on:input={handleInput}></textarea>

                </div>

                <button id="processfile" on:click|preventDefault={handleUpload}>Absenden</button>

            </form>

            <p id="feedback">{feedback ? feedback : ''}</p>

        {/if}

        {#each posts as post, index}

            <div class="posts">
                <img src={post.picture} alt={post.picture} class="post-picture" on:click={openModal} on:keydown={openModal}>
                <div class="post-meta">
                    <div class="post-meta-left">
                        <p class="name">{post.name}</p>
                    </div>
                    <div class="post-meta-right">

                        <p class="date">{post.createdAt}</p>

                        {#if (currentUser === post.uid)}

                            <button class="delete"><img src="{deleteSrc}" alt="add" on:mouseover={handleDeleteFocus} on:focus={handleDeleteFocus} on:mouseout={handleDeleteBlur} on:blur={handleDeleteBlur} on:click={() => handleDelete}>
                            </button>

                        {/if}

                    </div>
                </div>
                <p class="pstcmmnt">{post.message}</p>
                <button class="comment" class:open={unsichtbar[index]} on:click={() => handleUnsichtbar(index)}>
                    <img src="{addSrc}" alt="add" on:mouseover={handleAddFocus} on:focus={handleAddFocus} on:mouseout={handleAddBlur} on:blur={handleAddBlur}>
                </button>
            </div>

            {#if unsichtbar[index]}

                <form transition:slide>
                    <label for="comment">Dein Kommentar</label>
                    <textarea type="text" name="comment" bind:value={comment[index]} style:height={heights[index]} on:input={e => handleHeights(e, index)}></textarea>
                    <button on:click|preventDefault={() => handleComment(post.id, index)}>Kommentar absenden</button>
                </form>

            {/if}


                {#if (commentsFlattened.includes(post.id))}
                
                    {#each comments as cmmnt, index}

                        {#if (post.id == cmmnt.postid)}
                    
                            <div class="post-meta">

                                <div class="post-meta-left">
                                    <p class="name">{cmmnt.cname}</p>
                                </div>
                                <div class="post-meta-right">
                                    <p class="date">{cmmnt.createdAt}</p>
                                    <button class="delete">
                                        <img src="{deleteSrc}" alt="add" on:mouseover={handleDeleteFocus} on:focus={handleDeleteFocus} on:mouseout={handleDeleteBlur} on:blur={handleDeleteBlur}>
                                    </button>
                                </div>
                                
                            </div>
                            <p class="pstcmmnt">{cmmnt.comment}</p>
                        
                        {:else}
                            
                            <p></p>                    
                        
                        {/if}

                    {/each}

                {:else}

                    <p class="no-comments">Keine Kommentare</p>

                {/if}

        <!-- {:else}

            <p class="temporary"></p> -->

            <hr>

        {/each}

    {#if (modal)}

        <div class="modal" on:click={closeModal} on:keydown={closeModal}>

            <img src={bigImg} alt="" />

        </div>

    {/if}


    </main>

    <footer>
        <a href="https://notanumber.ch" target="_blank" rel="noopener noreferrer">notanumber.ch</a>
        <a href="https://emojiterra.com/duck/" target="_blank" rel="noopener noreferrer">emojiterra.com</a>
    </footer>

{/if}

<style>

    header {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
    }
    button#menu-button {
        grid-column-start: 2;
        justify-self: center;

        padding: 0;
        margin-bottom: .3rem;
        border: none;

        font-size: 4rem;

        transition: var(--transition-slow);
    }
    .open {
        rotate: 45deg;
    }
    
    div.side-options {
        grid-column-start: 3;
        justify-self: end !important;

        display: grid;
        grid-template-columns: auto auto;
        justify-content: end;
        align-items: center;

        padding-right: 1rem;
    }
    .side-options > button {
        padding: 0;
        border: none;
    }
    .side-options > a {
        overflow: hidden;
        padding: 0rem var(--default-margin) 0rem 0rem;

        font-size: var(--font-size-small);
        color: var(--split-complementary-2);
        line-height: normal;
    }
    .side-options > a:hover {
        color: var(--split-complementary-2-light)
    }

    main {
        max-width: 700px;
        margin: 0 auto;
        padding: 0 .3rem;
    }
    input[type="file"] {
        display: none;
    }
    div#drop-area {
        padding: 2rem 1rem;
        text-align: center;
        margin-bottom: var(--default-margin);
    }
    form > img {
        margin-left: auto;
        margin-right: auto;
    }
    button#processfile {
        width: 100%;
    }
    p#feedback {
        height: 3rem;
        
        text-align: center;
        color: var(--warning);
    }

    img.post-picture {
        margin-left: auto;
        margin-right: auto;
    }
    img.post-picture:hover {
        filter: brightness(110%);
    }
    div.post-meta {
        display: grid;
        grid-template-columns: auto max-content;
    }
    div.post-meta-left {
        align-self: start;
        text-align: left;

        display: grid;
        align-items: center;
    }
    div.post-meta-right {
        align-self: end;

        display: grid;
        grid-template-columns: auto auto;
        align-items: center;
        gap: 1rem;
    }
    div.post-meta-left > p,
    div.post-meta-right > p,
    div.post-meta-right > button {
        font-size: var(--font-size-small);
        margin: 0;
    }
    div.post-meta-left > p{
        overflow: hidden;
    }
    
    p.pstcmmnt {
        margin-top: .3rem;
    }
    p.name {
        color: var(--split-complementary-2);
    }
    p.date {
        color: whitesmoke;
    }

    button.delete {
        padding: 0;
        border: none;
    }
    button.delete > img {
        padding: 0;
        margin: 0;
    }

    button.comment {
        display: grid;
        grid-template-columns: 1fr;
        align-content: center;
        justify-items: center;
        width: 100%;
        padding: 0;
        margin: 0;
        margin-bottom: .3rem;
        border: none;

        font-size: 4rem;

        transition: var(--transition-slow);
    }
    
    p.no-comments {
        text-align: center;
    }

    /* p.temporary {
        width: 100%;
        text-align: center;
    } */

    div.modal {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 5;

        height: 100vh;
        width: 100vw;

        display: grid;
        align-items: center;
        justify-content: center;

        background-color: black;
    }
    hr {
        border-top: .1rem solid var(--text);
        margin-top: 5rem;
        margin-bottom: 7rem;
    }

    footer {
        text-align: center;
        margin-bottom: 5rem;
    }
    footer > a {
        display: block;
        font-size: var(--font-size-small);
        margin-bottom: var(--default-margin);
    }   

    @media only screen and (max-width: 730px) {
        header {
            max-width: 700px;
            margin: 0 auto;
        }
        div.side-options {
            padding: 0;
        }
    }

</style>