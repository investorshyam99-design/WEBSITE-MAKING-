async function searchDocs() {
   const res = await fetch("https://api.github.com/search/code?q=api.qikink.com+create+order", {
       headers: {
           "User-Agent": "Mozilla/5.0"
       }
   });
   console.log(res.status, await res.text());
}
searchDocs();
