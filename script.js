document.getElementById('fetchContent').addEventListener('click', function() {
    triggerFetchContent();
});

document.getElementById('urlInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the form from submitting if it's part of a form
        triggerFetchContent();
    }
});

function triggerFetchContent() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value;
    if (!url) {
        alert('Please enter a URL.');
        return;
    }
    
    urlInput.value = ''; // Clear input for next request

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            let content = '';
            const title = doc.querySelector('title');
            if (title) {
                let titleText = title.textContent.replace(" - Edinburgh Live", "");
                content += `<h1 class="headline">${titleText}</h1>`;
            }

            const imgSrc = doc.querySelector('.img-container img')?.src;
            if (imgSrc) {
                const imgTag = `<img src="${imgSrc}" class="img-responsive">`;
                content += `<div>${imgTag}</div>`;
            }

            const authorName = doc.querySelector('.author-information-container .author a.publication-theme')?.textContent;
            const publicationTime = doc.querySelector('.time-info .time-container')?.textContent;
            if (authorName && publicationTime) {
                content += `<p class="author-info">By ${authorName} | Published on ${publicationTime}</p>`;
                content += `<p class="separator">***</p>`;
            }

            // Exclude specific unwanted elements from the article content
            const unwantedSelectors = ['.mod-image', 'figcaption', 'p:contains("Read more:")', 'p:contains("Sign up for")', 'p:contains("Join")'];
            unwantedSelectors.forEach(selector => {
                doc.querySelectorAll(selector).forEach(elem => elem.remove());
            });

            // Handle links by replacing them with text
            doc.querySelectorAll('a').forEach(link => {
                const text = document.createTextNode(link.textContent);
                link.parentNode.replaceChild(text, link);
            });

            // Extract the body's innerHTML, then clean up whitespace
            let articleContent = doc.body.innerHTML;
            let cleanedContent = cleanUpWhitespace(articleContent);

            content += `<div class="content-body">${cleanedContent}</div>`;
            document.getElementById('contentDisplay').innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        });
}

function cleanUpWhitespace(htmlString) {
    // Remove excessive whitespace between tags and around the HTML string
    return htmlString.replace(/>\s+</g, '><').trim();
}
