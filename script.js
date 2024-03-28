document.getElementById('fetchContent').addEventListener('click', function() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value;
    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    urlInput.value = '';

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
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let formattedTime = publicationTime;
                try {
                    const parts = publicationTime.split(", ");
                    const dateParts = parts[1].split(" ");
                    const day = dateParts[0];
                    const month = months[new Date(`${dateParts[1]} 1, 2024`).getMonth()];
                    const year = dateParts[2];
                    formattedTime = `${day} ${month} ${year}, ${parts[0]}`;
                } catch (error) {
                    console.warn("Could not parse publication time:", publicationTime);
                }

                content += `<p class="author-info">By ${authorName} | Published on ${formattedTime}</p>`;
                content += `<p class="separator">***</p>`;
            }

            let articleContent = '';
            const articleStart = html.indexOf('<!-- Article Start-->') + '<!-- Article Start-->'.length;
            const articleEnd = html.indexOf('<!-- Article End-->');
            if (articleStart > -1 && articleEnd > -1) {
                articleContent = html.slice(articleStart, articleEnd);
                const articleFragment = parser.parseFromString(articleContent, 'text/html');

                const unwantedElements = articleFragment.querySelectorAll('p');
                unwantedElements.forEach(p => {
                    const textContentLower = p.textContent.toLowerCase().trim();

                    if (textContentLower.includes('read more:') || textContentLower.includes('sign up for') || textContentLower.includes('join')) {
                        p.remove();
                    }
                });

                const links = articleFragment.querySelectorAll('a');
                links.forEach(link => {
                    const text = document.createTextNode(link.textContent);
                    link.parentNode.replaceChild(text, link);
                });

                content += `<div class="content-body">${articleFragment.body.innerHTML}</div>`;
            }

            document.getElementById('contentDisplay').innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        });
});
