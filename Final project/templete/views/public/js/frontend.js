document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/images');
        if (!response.ok) {
            throw new Error('Failed to fetch images');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // Response is JSON
            const imageFileNames = await response.json();
            displayImages(imageFileNames);
        } else if (contentType && contentType.includes('text/html')) {
            // Response is HTML (possibly an error page)
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error(error);
    }
});

function displayImages(imageFileNames) {
    const imageGallery = document.getElementById('imageGallery');

    // Clear existing images
    imageGallery.innerHTML = '';

    // Display images in the gallery
    imageFileNames.forEach(fileName => {
        const img = document.createElement('img');
        img.src = `/uploads/${fileName}`; // Assuming your upload route is '/uploads'
        img.alt = fileName; // Set alt attribute to the file name
        imageGallery.appendChild(img);
    });
}
