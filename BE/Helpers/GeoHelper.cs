using System;

namespace BE.Helpers
{
    public static class GeoHelper
    {
        private const double EarthRadiusKm = 6371.0;

        /// <summary>
        /// Calculates Haversine distance in kilometers between two GPS points.
        /// Returns null if any coordinate is missing or invalid.
        /// </summary>
        public static double? CalculateDistanceKm(double? lat1, double? lon1, double? lat2, double? lon2)
        {
            if (!lat1.HasValue || !lon1.HasValue || !lat2.HasValue || !lon2.HasValue)
                return null;

            if (double.IsNaN(lat1.Value) || double.IsNaN(lon1.Value) || 
                double.IsNaN(lat2.Value) || double.IsNaN(lon2.Value))
                return null;

            // Null-island or invalid coordinates
            if (lat1.Value == 0 && lon1.Value == 0) return null;
            if (lat2.Value == 0 && lon2.Value == 0) return null;

            var dLat = (lat2.Value - lat1.Value) * Math.PI / 180.0;
            var dLon = (lon2.Value - lon1.Value) * Math.PI / 180.0;

            var rLat1 = lat1.Value * Math.PI / 180.0;
            var rLat2 = lat2.Value * Math.PI / 180.0;

            var a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0) +
                    Math.Cos(rLat1) * Math.Cos(rLat2) *
                    Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0);

            var c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));
            return Math.Round(EarthRadiusKm * c, 2);
        }
    }
}
