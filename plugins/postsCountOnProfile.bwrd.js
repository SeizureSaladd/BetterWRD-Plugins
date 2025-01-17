/*
    @name Posts Count on Profile Page
    @version 1.0.1
    @description Displays a posts & threads count on user profiles.
    @author david77
    @source https://raw.githubusercontent.com/davve77/BetterWRD-Plugins/main/plugins/postsCountOnProfile.bwrd.js
*/


// Plugin changelog
bwrd.showChangelog('4/21/2022', ['Fixed "Failed to fetch" error caused by forum being "downed"'])


if(location.pathname.match(/profile/g) && document.querySelector('#info')){
    (async ()=>{

        // CSS
        bwrd.injectStyle(`
        .stats-loading{
            height: 20px;
            width: 20px;
            opacity: .6;
            display: inline-block;
            border: 2px solid;
            border-radius: 50%;
            border-top-color: transparent;
            margin-top: 5px;
            animation: stats-loading-anim 1s linear infinite;
        }
        @keyframes stats-loading-anim {
            0% {transform: rotate(0);}
            100% {transform: rotate(360deg);}
        }`)

        
        // Create a stats sidecard
        let sideCards = document.querySelector('#profile_sidecards')
        let cloneSc = document.querySelector('.profile_content').cloneNode(true)
        let statsDiv = document.createElement('div')

        while(cloneSc.children.length > 1) cloneSc.lastChild.remove()
        cloneSc.children[0].textContent = 'Stats'
        statsDiv.className = 'statistics'
        statsDiv.innerHTML = `<div class="stats-loading"/>`

        cloneSc.appendChild(statsDiv)
        sideCards.prepend(document.createElement('br'))
        sideCards.prepend(cloneSc)


        // Find post to fetch
        var userID = document.querySelector('[href*="uid"]').href.split('=')[1]
        var posts = document.querySelectorAll('.activitycard')
        var chosenPost = undefined
        
        posts.forEach(post => {
            if(chosenPost == undefined){
                let postLink = post.querySelector('[href*="/forum/t/"]')
                if(postLink.href && !postLink.href.includes('page')) chosenPost = postLink.href.replace('forum', 'Forum')
            }
        })

        // No posts
        if(posts.length == 0){
            return statsDiv.innerHTML = 'No activity'
        }

        let fetchPost = await fetch(chosenPost).then(e => e.text())
        let postDoc = new DOMParser().parseFromString(fetchPost, 'text/html')

        // Cloudflare page
        if(postDoc.head.firstElementChild.textContent.startsWith('Verifying')){
            return statsDiv.innerHTML = 'Failed to fetch stats due to Cloudflare'
        }


        // Find post/thread count
        let found = false
        for(let elm of postDoc.querySelectorAll('.thread_replierdata')){
            let _userID = elm.firstElementChild.href.split('=')[1]
            if(_userID == userID){
                let statsDiv = elm.querySelector('.userstats')
                var postsCount = statsDiv.children[0].textContent.split(' ')[1]
                var threadCount = statsDiv.children[1].textContent.split(' ')[1]
                found = true
                break
            }
        }

        if(!found) return statsDiv.innerHTML = 'Failed to fetch'


        // Update stats sidecard
        statsDiv.innerHTML = `Posts: ${postsCount} <br> Threads: ${threadCount}`
    })()
}
