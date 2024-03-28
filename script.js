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

            // Exclude specific content such as 'mod-image' and 'figcaption'
            const modImages = doc.querySelectorAll('.mod-image');
            modImages.forEach(img => img.remove());

            const figcaptions = doc.querySelectorAll('figcaption');
            figcaptions.forEach(caption => caption.remove());

            const unwantedParagraphs = doc.querySelectorAll('p');
            unwantedParagraphs.forEach(p => {
                const textContentLower = p.textContent.toLowerCase().trim();
                if (textContentLower.includes('read more:') || textContentLower.includes('sign up for') || textContentLower.includes('join')) {
                    p.remove();
                }
            });

            const links = doc.querySelectorAll('a');
            links.forEach(link => {
                const text = document.createTextNode(link.textContent);
                link.parentNode.replaceChild(text, link);
            });

            // Construct the final content
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

            content += `<div class="content-body">${doc.body.innerHTML}</div>`;
            document.getElementById('contentDisplay').innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        });
}
