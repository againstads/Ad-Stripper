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

            // Ignore specific elements like factbox-header
            doc.querySelectorAll('.factbox-header').forEach(elem => elem.remove());

            let content = '';
            const title = doc.querySelector('title');
            if (title) {
                let titleText = title.textContent.replace(" - Edinburgh Live", "");
                content += titleText + " ";
            }

            const imgSrc = doc.querySelector('.img-container img')?.src;
            if (imgSrc) {
                // Include the main image as an HTML element.
                content += `<div><img src="${imgSrc}" class="img-responsive" alt="Main Image"></div>`;
            }

            const authorName = doc.querySelector('.author-information-container .author a.publication-theme')?.textContent;
            const publicationTime = doc.querySelector('.time-info .time-container')?.textContent;
            if (authorName && publicationTime) {
                content += `By ${authorName} | Published on ${publicationTime} `;
            }

            let articleContent = '';
            const articleStart = html.indexOf('<!-- Article Start-->') + '<!-- Article Start-->'.length;
            const articleEnd = html.indexOf('<!-- Article End-->');
            if (articleStart > -1 && articleEnd > -1) {
                articleContent = html.slice(articleStart, articleEnd);
                const articleFragment = parser.parseFromString(articleContent, 'text/html');

                // Flatten the articleFragment to plain text for the rest of the content.
                content += flattenContent(articleFragment.body);
            }

            // Set the content, using innerHTML for including the main image properly.
            document.getElementById('contentDisplay').innerHTML = cleanUpWhitespaceAndAddLineBreaks(content);
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        });
}

function cleanUpWhitespaceAndAddLineBreaks(htmlString) {
    // Reduce multiple whitespace to a single space in text and reintroduce line breaks after periods.
    let cleanedHtml = htmlString.replace(/\s\s+/g, ' ').trim();
    cleanedHtml = cleanedHtml.replace(/\. /g, '.<br><br>');
    return cleanedHtml;
}

function flattenContent(element) {
    let text = '';
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent + " ";
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
            text += flattenContent(node);
        }
    }
    // Introduce a line break after sentences for improved readability.
    text = text.replace(/\. /g, '.<br><br>');
    return text;
}
