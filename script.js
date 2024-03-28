document.getElementById('fetchContent').addEventListener('click', function() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    // Placeholder for fetching content; in practice, use a server-side proxy or CORS-friendly API
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            let content = '';

            // Extract title
            const title = doc.querySelector('title');
            if (title) content += `<h2>${title.textContent}</h2>`;

            // Extract specific div content and exclude undesired parts
            const imgContainer = doc.querySelector('.img-container');
            if (imgContainer) {
                let imgContainerHtml = imgContainer.innerHTML;
                const readMoreIndex = imgContainerHtml.indexOf('<p><b>READ MORE');
                if (readMoreIndex !== -1) {
                    imgContainerHtml = imgContainerHtml.substring(0, readMoreIndex);
                }
                content += `<div>${imgContainerHtml}</div>`;
            }

            // Extract and process article content
            const articleStartIndex = html.indexOf('<!-- Article Start-->') + '<!-- Article Start-->'.length;
            const articleEndIndex = html.indexOf('<!-- Article End-->');
            if (articleStartIndex > -1 && articleEndIndex > -1) {
                let articleContent = html.slice(articleStartIndex, articleEndIndex);
                const readMoreIndex = articleContent.indexOf('<p><b>READ MORE');
                if (readMoreIndex !== -1) {
                    articleContent = articleContent.substring(0, readMoreIndex);
                }
                content += `<div>${articleContent}</div>`;
            }

            document.getElementById('contentDisplay').innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content. This might be due to CORS policies.');
        });
});
