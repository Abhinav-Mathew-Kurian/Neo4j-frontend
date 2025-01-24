import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { MapPin,  Navigation } from 'lucide-react';
import Swal from 'sweetalert2';

const ChargingStationFinder = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chargingType, setChargingType] = useState('ALL');

  const findNearestStations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/nearest-stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          chargingType: chargingType
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindStations = () => {
    if (!latitude || !longitude) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter both latitude and longitude.',
      });
      return;
    }
    Swal.fire({
      title: 'Finding Stations...',
      text: 'Please wait while we find the nearest charging stations.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    findNearestStations().then(() => {
      Swal.close();
    });
  };

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', p: 2, boxShadow: 3 }}>
      <CardHeader title="EV Charging Station Finder" sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Latitude"
              variant="outlined"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              variant="outlined"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Charging Type</InputLabel>
              <Select
                value={chargingType}
                onChange={(e) => setChargingType(e.target.value)}
                label="Charging Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="DCFast">DC Fast Charging</MenuItem>
                <MenuItem value="Level2">Level 2 Charging</MenuItem>
                <MenuItem value="Level1">Level 1 Charging</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleFindStations}
              fullWidth
              disabled={loading}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              Find Stations
            </Button>
          </Grid>
        </Grid>

        {stations.map((station, index) => (
          <Card key={index} sx={{ mt: 2, p: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{station.station.name}</Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <MapPin size={16} style={{ marginRight: 8 }} /> {station.station.streetAddress}
              </Typography>
              <Typography>
                {station.station.city}, {station.station.state}
              </Typography>
              <Typography>
                <Navigation size={16} style={{ marginRight: 8 }} /> {(station.distanceMeters).toFixed(2)} Meters Or {" "}
                {(station.distanceMeters / 1000).toFixed(2)} Kilometers
              </Typography>
              <Typography>
                DC Fast Charger: {station?.station?.evDcFast !== null && station?.station?.evDcFast !== "" ? station.station.evDcFast + ' ports' : '0 ports'} |
                Level 2 Charger: {station?.station?.evLevel2 !== null && station?.station?.evLevel2 !== "" ? station.station.evLevel2 + ' ports' : '0 ports'} |
                Level 1 Charger: {station?.station?.evLevel1 !== null && station?.station?.evLevel1 !== "" ? station.station.evLevel1 + ' ports' : '0 ports'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default ChargingStationFinder;