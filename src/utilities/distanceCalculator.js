// Distance calculation utility using Google Maps API
export const calculateDistanceAndDeliveryFee = async (userAddress, storeLocation = { lat: 0.3476, lng: 32.5825 }) => {
  try {
    // Default store location (Kampala, Uganda coordinates)
    const service = new google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [storeLocation],
        destinations: [userAddress],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === 'OK') {
          const distance = response.rows[0].elements[0].distance;
          const duration = response.rows[0].elements[0].duration;
          
          if (distance && distance.value) {
            const distanceInKm = Math.ceil(distance.value / 1000); // Round up to nearest km
            const deliveryFee = distanceInKm * 1000; // 1000 shillings per km
            
            resolve({
              distance: distanceInKm,
              deliveryFee: deliveryFee,
              duration: duration.text,
              success: true
            });
          } else {
            reject({ success: false, error: 'Could not calculate distance' });
          }
        } else {
          reject({ success: false, error: `Distance Matrix API error: ${status}` });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Geocode address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
            success: true
          });
        } else {
          reject({ success: false, error: `Geocoding failed: ${status}` });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};