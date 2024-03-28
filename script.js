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

            // Exclude contents within specified selectors
            doc.querySelectorAll('.factbox-header, .factbox-content, .mod-image').forEach(elem => elem.remove());

            // Process the document to exclude paragraphs starting with "READ NEXT"
            Array.from(doc.querySelectorAll('p')).forEach(p => {
                if (p.textContent.trim().startsWith("READ NEXT")) {
                    p.remove();
                }
            });

            let content = '';
            const title = doc.querySelector('title');
            if (title) {
                let titleText = title.textContent.replace(" - Edinburgh Live", "");
                content += `<h1 class="headline">${titleText}</h1>`;
            }

            const imgSrc = doc.querySelector('.img-container img')?.src;
            if (imgSrc) {
                content += `<div><img src="${imgSrc}" class="img-responsive" alt="Main Image"></div>`;
            }

            const authorName = doc.querySelector('.author-information-container .author a.publication-theme')?.textContent;
            const publicationTime = doc.querySelector('.time-info .time-container')?.textContent;
            if (authorName && publicationTime) {
                content += `<p class="author-info">By ${authorName} | Published on ${publicationTime}</p><br><br>`; // Two line breaks after author info
            }

            let articleContent = '';
            const articleStart = html.indexOf('<!-- Article Start-->') + '<!-- Article Start-->'.length;
            const articleEnd = html.indexOf('<!-- Article End-->');
            if (articleStart > -1 && articleEnd > -1) {
                articleContent = html.slice(articleStart, articleEnd);
                const articleFragment = parser.parseFromString(articleContent, 'text/html');
                content += flattenContent(articleFragment.body);
            }

            document.getElementById('contentDisplay').innerHTML = cleanUpWhitespaceAndAddLineBreaks(content);
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        });
}

function cleanUpWhitespaceAndAddLineBreaks(htmlString) {
    let cleanedHtml = htmlString.replace(/\s\s+/g, ' ').trim(); // Reduce multiple whitespaces to a single space
    cleanedHtml = cleanedHtml.replace(/(?<!”)\. /g, '.<br><br>'); // Add line breaks after periods not followed by a quote
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
    // Replace “.” with “.” to avoid breaking quotes into multiple paragraphs
    text = text.replace(/”\. /g, '”. ');
    return text;
}
