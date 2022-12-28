const data_input = {
    posts: [
        {id: 0, user: "                  robin@gmail.se                     ", content: "<script>alert('wow')</script>"},
        {id: 1, user: "robin.andreasson@metabytes.se", content: "With damn good business impact"},
        {id: 2, user: "ludwig@ludvig.se", content: "Ludwig"},
        {id: 3, user: "smedberg.tor@rot.se", content: "root user (not)"}
    ],
    comments: [
        {id: 1, postId: 1, user: "test-user-1", content: "test-content-1"},
        {id: 2, postId: 2, user: "test-user-2", content: "test-content-2"},
        {id: 3, postId: 2, user: "test-user-3", content: "test-content-3"},
        {id: 4, postId: 2, user: "test-user-4", content: "test-content-4"},
        {id: 5, postId: 1, user: "test-user-5", content: "test-content-5"},
        {id: 6, postId: 3, user: "test-user-6", content: "test-content-6"},
        {id: 7, postId: 3, user: "test-user-7", content: "test-content-7"},
        {id: 8, postId: 1, user: "test-user-8", content: "test-content-8"},
    ],
    title: "HTML TEMPLATE ENGINE TEST PAGE",
    NoComments: "No comments for post"
}

const links = {
    links: [
        {url: '/posts', title: 'posts'},
        {url: '/comments', title: 'comments'},
    ],
    LoggedIn: true,
    
    Number: 4,

    'home-title': 'HOME!',
    String: `damn wow cool guy`,
    alert: `<script>alert("wow")</script>`,

    test: `&lt;script&gt;alert(&quot;wow&quot;)&lt;/script&gt;`,


    attributetest: [ `<script>alert("DAMN1")</script>`, `<script>alert("DAMN2")</script>` ],


    trimTest: '   -WOWOWOWO-   '
}


module.exports = { data_input, links }