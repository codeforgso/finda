define(function(require) {
  'use strict';
  var flight = require('flight');
  var _  = require('lodash');
  var $ = require('jquery');

  return flight.component(function search() {
    this.defaultAttrs({
      searchUrl: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates'
    });
    this.configureSearch = function(ev, config) {
      if (config.search && config.search.geosearch) {
        this.maxBounds = config.map.maxBounds;
      } else {
        this.teardown();
      }
    };

    this.onSearch = function(ev, options) {
      ev.preventDefault();
      var parameters = {
        f: 'json',
        singleLine: options.query,
        maxLocations: 1
      };
      if (this.maxBounds) {
        parameters.searchExtent = [
          this.maxBounds[1][1], this.maxBounds[0][0],
          this.maxBounds[0][1], this.maxBounds[1][0]
        ].join(',');
      }
      $.getJSON(this.attr.searchUrl,
                parameters,
                this.searchResults.bind(this));
    };

    this.searchResults = function(result) {
      if (result.candidates.length) {
        var candidate = result.candidates[0],
            displayName = candidate.address;
        this.trigger('dataSearchResult', {
          name: displayName,
          lat: candidate.location.y,
          lng: candidate.location.x
        });
      }
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'uiSearch', this.onSearch);
    });
  });
});
