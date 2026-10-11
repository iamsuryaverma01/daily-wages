import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch location details from a pincode
 * @param {string} pincode - 6 digit pincode
 * @returns {object} { locationData, loading, error }
 */
const usePincode = (pincode) => {
    const [locationData, setLocationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const pinStr = pincode?.toString() || '';
        if (pinStr.length !== 6 || isNaN(pinStr)) {
            setLocationData(null);
            setError(null);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
                if (!response.ok) {
                    throw new Error('Invalid pincode');
                }
                const data = await response.json();
                const place = data.places[0];
                setLocationData({
                    placeName: place['place name'],
                    state: place['state'],
                    coordinates: [parseFloat(place.longitude), parseFloat(place.latitude)]
                });
            } catch (err) {
                setError(err.message);
                setLocationData(null);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchDetails, 600);
        return () => clearTimeout(timer);
    }, [pincode]);

    return { locationData, loading, error };
};

export default usePincode;
