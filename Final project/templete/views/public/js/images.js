document.addEventListener('DOMContentLoaded', () => {
    fetch('/src/uploads')
    .then(response => response.json())
    .then(data => {
        const profileDetails = document.getElementById('profile-details');
        profileDetails.innerHTML = `
            <div class="profile-details">
                <p>Name: ${data.file.name}</p>
                <p>Email: ${data.file.email}</p>
                <p>Phone: ${data.file.phone}</p>
            </div>
        `;
    })
    .catch(error => console.error('Error fetching profile data:', error));

    fetch('/images')
    .then(response => response.json())
    .then(data => {
        const imageList = document.getElementById('image-list');
        if (data.length === 0) {
            imageList.innerHTML = '<p>No images uploaded.</p>';
        } else {
            const imageHTML = data.map(filename => `<img src="/images/${filename}" alt="${filename}" />`).join('');
            imageList.innerHTML = imageHTML;
        }
    })
    .catch(error => console.error('Error fetching image data:', error));
});
