function autocomplete(input, latInput, lngInput) {
  if (!input) return; // Skip this from running if there is no input on the page

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  // if someone hits enter on the addres field don't submit the form

  input.on('ketdown', e => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete;
