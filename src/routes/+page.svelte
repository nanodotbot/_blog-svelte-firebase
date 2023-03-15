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

    let postAddSrc = [];
    const handlePostAddFocus = (index) => {
        postAddSrc[index] = Addc3f2e6;
    }
    const handlePostAddBlur = (index) => {
        postAddSrc[index] = Add99e8d4;
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

    let postDeleteSrc = [];
    const handlePostDeleteFocus = (index) => {
        postDeleteSrc[index] = Deletef8e0de;
    }
    const handlePostDeleteBlur = (index) => {
        postDeleteSrc[index] = Deleteedbeae;
    }

    let commentDeleteSrc = [];
    const handleCommentDeleteFocus = (index) => {
        commentDeleteSrc[index] = Deletef8e0de;
    }
    const handleCommentDeleteBlur = (index) => {
        commentDeleteSrc[index] = Deleteedbeae;
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
    };

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
        postAddSrc = Array(posts.length).fill(Add99e8d4);
        postDeleteSrc = Array(posts.length).fill(Deleteedbeae);
        // console.log(postAddSrc);
    });

    let comment = [];
    let unsichtbar = [];
    //https://stackoverflow.com/questions/57728657/problems-with-toggle-the-display-of-a-div-in-a-nested-svelte-each-block

    const handleUnsichtbar = (index) => {
        unsichtbar[index]=!unsichtbar[index];
    };

    let heights = [];
    const handleHeights = (e, index) => {
        heights[index ] = '';
        heights[index] = e.target.scrollHeight + 1 + 'px';
        // console.log(heights[index]);
        // console.log(e.target.scrollHeight);
        // why does scrollheigt apply to all elements?
    };


    const cllctnC = collection(db, 'comments');
    const handleComment = (id, index) => {
        // console.log(id);
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
    };

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
            commentDeleteSrc = Array(comments.length).fill(Deleteedbeae);
            // console.log(comment.createdAt);
            // console.log(commentsFlattened);
        });
    });

    let docTypeg = '';
    let docCllctn = '';
    let docContentg = '';
    let docIDg = '';
    let deleteModal = false;

    const deleteForever = () => {
        const dcmnt = doc(db, docCllctn, docIDg);
        deleteDoc(dcmnt)
            .then(() => console.log('deleted:', docTypeg, docContentg, docIDg));
    };

    const handleDelete = (docType, docContent, docID) => {
        docTypeg = docType;
        docContentg = docContent;
        docIDg = docID;
        if (docTypeg === 'Post') {docCllctn = 'posts'};
        if (docTypeg === 'Kommentar') {docCllctn = 'comments'};
        deleteModal = true;
    };

    const closeDeleteModal = () => {
        deleteModal = false;
    };

    let modal = false;
    let bigImg = '';
    const openModal = (e) => {
        bigImg = e.target.src;
        // console.log(e.target.src);
        modal = true;
    };
    const closeModal = () => {
        modal = false;
    };

    onMount(() => {
        currentUser = localStorage.getItem('uid');
        // console.log('current user / uid from localStorage is:', currentUser);
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

                            <button class="delete"><img src="{postDeleteSrc[index]}" alt="add" on:mouseover={() => handlePostDeleteFocus(index)} on:focus={() => handlePostDeleteFocus(index)} on:mouseout={() => handlePostDeleteBlur(index)} on:blur={() => handlePostDeleteBlur(index)} on:click={() => handleDelete('Post', post.message, post.id)} on:keydown={() => handleDelete('Post', post.message, post.id)}>
                            </button>

                        {/if}

                    </div>
                </div>
                <p class="pstcmmnt">{post.message}</p>

                <button class="comment" class:open={unsichtbar[index]} on:click={() => handleUnsichtbar(index)}>
                    <img src="{postAddSrc[index]}" alt="add" on:mouseover={() => handlePostAddFocus(index)} on:focus={() => handlePostAddFocus(index)} on:mouseout={() => handlePostAddBlur(index)} on:blur={() => handlePostAddBlur(index)}>
                </button>
            </div>

            {#if unsichtbar[index]}

                <form transition:slide>
                    <label for="comment">Dein Kommentar</label>
                    <textarea type="text" name="comment" bind:value={comment[index]} style:height={heights[index]} on:input={e => handleHeights(e, index)}></textarea>
                    <button class="send-comment" on:click|preventDefault={() => handleComment(post.id, index)}>Kommentar absenden</button>
                </form>

            {/if}


                {#if (commentsFlattened.includes(post.id))}
                
                    {#each comments as cmmnt, indexx}

                        {#if (post.id == cmmnt.postid)}
                    
                            <div class="post-meta">

                                <div class="post-meta-left">
                                    <p class="name">{cmmnt.cname}</p>
                                </div>
                                <div class="post-meta-right">
                                    <p class="date">{cmmnt.createdAt}</p>

                                    {#if (currentUser === cmmnt.uid)}

                                        <button class="delete" on:mouseover={() => handleCommentDeleteFocus(indexx)} on:focus={() => handleCommentDeleteFocus(indexx)} on:mouseout={() => handleCommentDeleteBlur(indexx)} on:blur={() => handleCommentDeleteBlur(indexx)} on:click={() => handleDelete('Kommentar', cmmnt.comment, cmmnt.id)} on:keydown={() => handleDelete('Kommentar', cmmnt.comment, cmmnt.id)}>
                                            <img src="{commentDeleteSrc[indexx]}" alt="add">
                                        </button>

                                    {/if}

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

        {#if (deleteModal)}

            <div class="deleteModal" on:click={closeDeleteModal} on:keydown={closeDeleteModal}>
                <div>
                    <h3>{docTypeg} löschen?</h3>
                    <p>Möchtest du deinen {docTypeg} wirklich unwiderruflich löschen?</p>
                    <p class="docContentg">{docContentg}</p>
                    <button class="deleteBtn" on:click={deleteForever} on:keydown={deleteForever}>Ja, weg damit!</button>
                    <button>Ne, das ist ein wertvoller Beitrag für den Weltfrieden</button>
                </div>
            </div>
            
        {/if}

    </main>

    <footer>
        <a href="https://notanumber.ch" target="_blank" rel="noopener noreferrer" class="link">notanumber.ch</a>
        <a href="https://emojipedia.org/de/ente/" target="_blank" rel="noopener noreferrer" class="link">emojipedia.org</a>
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
    button.send-comment {
        width: 100%;
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

    div.deleteModal {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 5;

        height: 100vh;
        width: 100vw;

        display: grid;
        align-items: center;
        justify-items: center;
        align-content: center;

        background-color: var(--background-transparent);
    }
    div.deleteModal > div {
        padding: 3rem 4rem 4rem 4rem;
        background-color: var(--background);
    }
    div.deleteModal > div > p,
    div.deleteModal > div > h3 {
        width: 100%;
        text-align: center;
    }
    div.deleteModal > div > button {
        width: 100%;
        margin-top: 2rem;
    }
    div.deleteModal > div > button.deleteBtn {
        color: var(--warning);
        border: .1rem solid var(--warning);
    }
    div.deleteModal > div > button.deleteBtn:hover {
        color: var(--split-complementary-1-lighter);
        border: .1rem solid var(--split-complementary-1-lighter);
    }
    div.deleteModal > div > p.docContentg {
        padding: 1rem;
        border: .1rem solid var(--split-complementary-1-lighter);
        font-size: var(--font-size-smallest);
        overflow: hidden;
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