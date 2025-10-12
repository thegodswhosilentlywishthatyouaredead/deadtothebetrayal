const axios = require('axios');
const geolib = require('geolib');

class GeolocationService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Object} point1 - {latitude, longitude}
   * @param {Object} point2 - {latitude, longitude}
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(point1, point2) {
    return geolib.getDistance(point1, point2) / 1000; // Convert meters to kilometers
  }

  /**
   * Get travel time and distance using Google Maps API
   * @param {Object} origin - {latitude, longitude}
   * @param {Object} destination - {latitude, longitude}
   * @param {string} mode - 'driving', 'walking', 'transit', 'bicycling'
   * @returns {Object} - {distance, duration, route}
   */
  async getTravelTimeAndDistance(origin, destination, mode = 'driving') {
    try {
      if (!this.googleMapsApiKey) {
        // Fallback to simple calculation if no API key
        return this.getFallbackTravelData(origin, destination);
      }

      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin: originStr,
          destination: destinationStr,
          mode: mode,
          key: this.googleMapsApiKey,
          traffic_model: 'best_guess',
          departure_time: Math.floor(Date.now() / 1000) // Current time
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance.value / 1000, // Convert to kilometers
        duration: leg.duration.value / 60, // Convert to minutes
        durationInTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.value / 60 : leg.duration.value / 60,
        route: route.overview_polyline.points,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.value / 1000,
          duration: step.duration.value / 60
        }))
      };

    } catch (error) {
      console.error('Error getting travel time:', error);
      return this.getFallbackTravelData(origin, destination);
    }
  }

  /**
   * Fallback method when Google Maps API is not available
   */
  getFallbackTravelData(origin, destination) {
    const distance = this.calculateDistance(origin, destination);
    const duration = distance * 1.5; // Rough estimate: 1.5 minutes per km
    
    return {
      distance,
      duration,
      durationInTraffic: duration * 1.2, // Add 20% for traffic
      route: null,
      steps: []
    };
  }

  /**
   * Get optimized route for multiple destinations (TSP approximation)
   * @param {Object} startPoint - Starting location
   * @param {Array} destinations - Array of {latitude, longitude, id}
   * @returns {Array} - Optimized order of destinations
   */
  async getOptimizedRoute(startPoint, destinations) {
    if (destinations.length <= 1) {
      return destinations;
    }

    // Simple nearest neighbor algorithm for TSP
    const optimizedRoute = [];
    const unvisited = [...destinations];
    let currentPoint = startPoint;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(currentPoint, unvisited[0]);

      // Find nearest unvisited destination
      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(currentPoint, unvisited[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = unvisited.splice(nearestIndex, 1)[0];
      optimizedRoute.push(nearest);
      currentPoint = nearest;
    }

    return optimizedRoute;
  }

  /**
   * Get geocoded address from coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} - Address information
   */
  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.googleMapsApiKey) {
        return { address: 'Address not available', city: 'Unknown', state: 'Unknown' };
      }

      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        return { address: 'Address not found', city: 'Unknown', state: 'Unknown' };
      }

      const result = response.data.results[0];
      const addressComponents = result.address_components;
      
      let city = 'Unknown';
      let state = 'Unknown';
      let zipCode = 'Unknown';

      addressComponents.forEach(component => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (component.types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      return {
        address: result.formatted_address,
        city,
        state,
        zipCode,
        placeId: result.place_id
      };

    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return { address: 'Address not available', city: 'Unknown', state: 'Unknown' };
    }
  }

  /**
   * Get coordinates from address
   * @param {string} address
   * @returns {Object} - {latitude, longitude}
   */
  async geocode(address) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: address,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };

    } catch (error) {
      console.error('Error in geocoding:', error);
      throw error;
    }
  }

  /**
   * Calculate total journey time for a field team member
   * @param {Object} teamLocation - Current team location
   * @param {Array} tickets - Array of tickets to visit
   * @returns {Object} - Journey summary
   */
  async calculateTotalJourney(teamLocation, tickets) {
    if (tickets.length === 0) {
      return { totalDistance: 0, totalTime: 0, route: [] };
    }

    // Optimize route
    const destinations = tickets.map(ticket => ({
      latitude: ticket.location.latitude,
      longitude: ticket.location.longitude,
      id: ticket._id,
      ticketNumber: ticket.ticketNumber
    }));

    const optimizedRoute = await this.getOptimizedRoute(teamLocation, destinations);
    
    let totalDistance = 0;
    let totalTime = 0;
    const route = [];
    let currentPoint = teamLocation;

    for (const destination of optimizedRoute) {
      const travelData = await this.getTravelTimeAndDistance(currentPoint, destination);
      
      totalDistance += travelData.distance;
      totalTime += travelData.durationInTraffic;
      
      route.push({
        ticketId: destination.id,
        ticketNumber: destination.ticketNumber,
        distance: travelData.distance,
        duration: travelData.durationInTraffic,
        coordinates: destination
      });
      
      currentPoint = destination;
    }

    return {
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime),
      route,
      optimizedOrder: optimizedRoute.map(d => d.ticketNumber)
    };
  }

  /**
   * Get nearby field team members within radius
   * @param {Object} location - {latitude, longitude}
   * @param {Array} teams - Array of field team members
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Array} - Nearby teams sorted by distance
   */
  getNearbyTeams(location, teams, radiusKm = 50) {
    const nearbyTeams = teams
      .map(team => ({
        ...team.toObject(),
        distance: this.calculateDistance(location, team.currentLocation)
      }))
      .filter(team => team.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyTeams;
  }

  /**
   * Validate coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {boolean}
   */
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}

module.exports = new GeolocationService();
