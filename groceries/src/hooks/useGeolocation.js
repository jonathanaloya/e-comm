import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return Promise.reject('Geolocation not supported');
    }

    setLoading(true);
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (error) => {
          setLoading(false);
          let message = 'Unable to get location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          
          toast.error(message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results[0]) {
        return parseAddressComponents(data.results[0]);
      }
      throw new Error('No address found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }, []);

  const parseAddressComponents = (result) => {
    const components = result.address_components;
    const address = {
      address_line: result.formatted_address,
      city: '',
      state: '',
      country: '',
      pincode: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
      if (types.includes('postal_code')) {
        address.pincode = component.long_name;
      }
    });

    return address;
  };

  return {
    loading,
    location,
    getCurrentLocation,
    reverseGeocode
  };
};