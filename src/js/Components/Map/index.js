import React from 'react';
import PropTypes from 'prop-types';

import { createMap, addMarker, iconBase } from "./helpers/googleHandlers";

const markers = [];

export default class GMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMarkerID: ''
    };

    this.handleRemove = this.handleRemove.bind(this);
    this.handleDisable = this.handleDisable.bind(this);
  }
  componentDidMount() {
    const props = this.props;
    const state = this.state;
    const This = this;
    const map = createMap(this.props.mapID, this.props.places, this.props.zoom);

    if (this.props.tripplaner) {
      const input = document.getElementById('pac-input');
      const infowindow = new window.google.maps.InfoWindow();
      const service = new window.google.maps.places.PlacesService(map);
      const searchBox = new window.google.maps.places.SearchBox(input);
      const bounds = new window.google.maps.LatLngBounds();

      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });
      searchBox.addListener('places_changed', function() {
        const places = searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }
        // For each place, get the icon, name and location.
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          // Create a marker for each place.
          let newMarker = addMarker(map, place, props.color, "click");
          newMarker.addListener('click', function(e) {
            infowindow.setContent('<div><div class="google-popup__delete fa fa-trash"> </div><strong>' + place.name + '</strong><br>' +
              place.formatted_address + '</div>');
            infowindow.open(map, this);
            This.setState({ currentMarkerID: place.place_id });
          });
          markers[place.place_id] = newMarker;

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
    }

    if (this.props.places.length > 1) {
      let origin = this.props.places[0].lat + ',' + this.props.places[0].lng;
      let destination = this.props.places[this.props.places.length - 1].lat + ',' + this.props.places[this.props.places.length - 1].lng;
      let tmpWaypoint = this.props.places.map(function(e) {
        return e;
      });
      tmpWaypoint.splice((this.props.places.length - 1), 1);
      tmpWaypoint.splice(0, 1);
      let waypoints;

      if (tmpWaypoint.length > 0) {
        waypoints = tmpWaypoint.map((item) => {
          return {
            location: item.lat + ',' + item.lng
          };
        });
      }
      let dirService = new window.google.maps.DirectionsService();
      let dirRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false
      });
      dirRenderer.setMap(map);
      let request = {
        origin,
        destination,
        waypoints,
        travelMode: "WALKING"
      };
      dirService.route(request, function(result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          dirRenderer.setDirections(result);
          let route = result.routes[0];
          let distance = 0;
          for (var i = 0; i < route.legs.length; i++) {
            distance += route.legs[i].distance.value;
          }
          props.getDistance(distance / 1000);
        }
      });
    } else if (this.props.places.length === 1) {
      let position = {
        lat: parseInt(this.props.places[0].lat, 10),
        lng: parseInt(this.props.places[0].lng, 10),
      }
      addMarker(map, position, props.color);
    }
  }

  handleDisable() {
    markers[this.state.currentMarkerID].setIcon(iconBase + "ccc");
  }

  handleRemove() {
    markers[this.state.currentMarkerID].setMap(null);
    markers.splice(this.state.currentMarkerID, 1);
  }

  render() {
    return (
      <div className = "google-map" >
        <div style = {{ width: '100%', height: '100%' }} id = { this.props.mapID } ref = 'map' />
        { this.props.children ? this.props.children : null }
        { this.props.tripplaner && <div className="google-map__placeOptions">
            <button className="btn btn-secondary" onClick={this.handleDisable}> <span className="fa fa-trash-o"> </span> Disable place </button>
            <button className="btn btn-danger" onClick={this.handleRemove}> <span className="fa fa-trash-o"> </span> Remove place </button>
          </div> }
      </div>
    )
  }

};

GMap.propTypes = {
  google: PropTypes.object,
  zoom: PropTypes.number,
  initialCenter: PropTypes.object,
  color: PropTypes.string,
}
GMap.defaultProps = {
  zoom: 8,
  initialCenter: {
    lat: 37.774929,
    lng: -122.419416
  },
  center: {},
  centerAroundCurrentLocation: false,
  style: {},
  containerStyle: {},
  visible: true,
  mapID: "map-0",
  color: 'fff',
}