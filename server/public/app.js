const listingGrid = document.querySelector('#listingGrid');
const listingForm = document.querySelector('#listingForm');

async function fetchListings() {
  try {
    const response = await fetch('/api/listings');
    const listings = await response.json();
    renderListings(listings);
  } catch (error) {
    listingGrid.innerHTML = '<p class="empty-state">Could not load listings. Make sure the server is running.</p>';
  }
}

function renderListings(listings) {
  if (!listings.length) {
    listingGrid.innerHTML = '<p class="empty-state">No listings yet. Be the first to post one.</p>';
    return;
  }

  listingGrid.innerHTML = listings.map((listing) => `
    <article class="listing-card">
      <h3>${listing.title}</h3>
      <p class="price">$${Number(listing.price).toLocaleString()}/mo</p>
      <p class="location">${listing.location}</p>
      <p>${listing.description || 'No description added yet.'}</p>
      <p class="contact">${listing.contactEmail}</p>
      <span class="pill">${listing.available ? 'Available' : 'Taken'}</span>
    </article>
  `).join('');
}

listingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(listingForm);
  const listing = {
    title: formData.get('title'),
    price: Number(formData.get('price')),
    location: formData.get('location'),
    contactEmail: formData.get('contactEmail'),
    description: formData.get('description'),
  };

  try {
    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });

    if (!response.ok) {
      throw new Error('Listing failed');
    }

    listingForm.reset();
    fetchListings();
  } catch (error) {
    alert('Could not create listing. Check your server and MongoDB connection.');
  }
});

fetchListings();