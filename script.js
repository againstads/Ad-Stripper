document.getElementById('fetchContent').addEventListener('click', function() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    // This is a placeholder for fetching content. You'd need a server-side proxy or CORS-friendly API.
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            let content = '';

            // Extract title
            const title = doc.querySelector('title');
            if (title) content += `<h2>${title.textContent}</h2>`;

            // Extract specific div content
            const imgContainer = doc.querySelector('.img-container');
            if (imgContainer) content += `<div>${imgContainer.innerHTML}</div>`;

            // Extract article content
            const articleStart = html.indexOf('<!-- Article Start-->') + '<!-- Article Start-->'.length;
            const articleEnd = html.indexOf('<!-- Article End-->');
            if (articleStart > -1 && articleEnd > -1) {
                const articleContent = html.slice(articleStart, articleEnd);
                content += `<div>${articleContent}</div>`;
            }

            document.getElementById('contentDisplay').innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content. This might be due to CORS policies.');
        });
});
