import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation, 
  Filter,
  Search,
  ArrowLeft,
  Globe,
  Shield,
  Info,
  Bus,
  Train,
  Car
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RatingDisplay, WaitTimeDisplay, StatusIndicator } from '@/components/TriageVisualFeedback';
import { 
  sanFranciscoHealthcareFacilities, 
  findNearbyFacilities, 
  getNeighborhoodByCoordinates,
  getTransportationOptions,
  sanFranciscoHealthcareStats,
  type SanFranciscoHealthcareFacility 
} from '@/data/sanFranciscoHealthcareData';

// Use the San Francisco healthcare facility interface
type HealthcareFacility = SanFranciscoHealthcareFacility;

interface TriageResourcesData {
  triageLevel: string;
}

const TriageResources = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const triageData: TriageResourcesData = location.state || { triageLevel: 'urgent_care' };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<HealthcareFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use San Francisco healthcare facilities data
  const mockFacilities: HealthcareFacility[] = sanFranciscoHealthcareFacilities;

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFacilities(mockFacilities);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchQuery, selectedType]);

  const filterFacilities = () => {
    let filtered = facilities;

    // Filter by triage level
    if (triageData.triageLevel === 'emergency') {
      filtered = filtered.filter(f => f.type === 'emergency');
    } else if (triageData.triageLevel === 'urgent_care') {
      filtered = filtered.filter(f => f.type === 'urgent_care' || f.type === 'emergency');
    } else if (triageData.triageLevel === 'primary_care') {
      filtered = filtered.filter(f => f.type === 'primary_care' || f.type === 'urgent_care');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(f => f.type === selectedType);
    }

    setFilteredFacilities(filtered);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      emergency: 'Emergency',
      urgent_care: 'Urgent Care',
      primary_care: 'Primary Care',
      specialist: 'Specialist',
      hospital: 'Hospital'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      emergency: 'bg-red-100 text-red-800',
      urgent_care: 'bg-orange-100 text-orange-800',
      primary_care: 'bg-blue-100 text-blue-800',
      specialist: 'bg-purple-100 text-purple-800',
      hospital: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleDirections = (facility: HealthcareFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleBookAppointment = (facility: HealthcareFacility) => {
    toast({
      title: "Appointment Booking",
      description: `Redirecting to ${facility.name} appointment system...`,
    });
    // In a real app, this would redirect to the facility's booking system
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding healthcare resources near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/triage-results')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Find Healthcare Resources</h1>
                <p className="text-sm text-gray-500">Based on your triage level: {getTypeLabel(triageData.triageLevel)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="shadow-sm border-0 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search facilities or addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="emergency">Emergency</option>
                <option value="urgent_care">Urgent Care</option>
                <option value="primary_care">Primary Care</option>
              </select>

              <Button
                variant="outline"
                className="border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count and SF Stats */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Found {filteredFacilities.length} healthcare facility{filteredFacilities.length !== 1 ? 'ies' : ''} near you
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>San Francisco Bay Area</span>
            </div>
          </div>
          
          {/* San Francisco Healthcare Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{sanFranciscoHealthcareStats.hospitals}</div>
              <div className="text-xs text-blue-800">Hospitals</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{sanFranciscoHealthcareStats.urgentCareCenters}</div>
              <div className="text-xs text-green-800">Urgent Care</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{sanFranciscoHealthcareStats.primaryCareClinics}</div>
              <div className="text-xs text-purple-800">Primary Care</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{sanFranciscoHealthcareStats.insuranceCoverage.insured}%</div>
              <div className="text-xs text-orange-800">Insured</div>
            </div>
          </div>
        </div>

        {/* Facilities List */}
        <div className="space-y-4">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Facility Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {facility.name}
                        </h3>
                                                 <div className="flex items-center gap-2 mb-2">
                           <Badge className={getTypeColor(facility.type)}>
                             {getTypeLabel(facility.type)}
                           </Badge>
                           {facility.open24h && (
                             <Badge variant="secondary" className="bg-green-100 text-green-800">
                               24/7
                             </Badge>
                           )}
                           {facility.acceptsInsurance && (
                             <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                               Insurance Accepted
                             </Badge>
                           )}
                           {facility.acceptsMedicaid && (
                             <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                               Medicaid
                             </Badge>
                           )}
                           {facility.slidingScale && (
                             <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                               Sliding Scale
                             </Badge>
                           )}
                         </div>
                      </div>
                                             <div className="text-right">
                         <RatingDisplay rating={facility.rating} size="sm" showText={false} />
                         <span className="text-sm text-gray-500 mt-1 block">{facility.distance}</span>
                       </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{facility.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {facility.neighborhood}
                        </span>
                      </div>
                      {facility.waitTime && (
                        <div className="flex items-center gap-2">
                          <WaitTimeDisplay 
                            waitTime={facility.waitTime} 
                            isUrgent={facility.waitTime.includes('45') || facility.waitTime.includes('60')}
                          />
                        </div>
                      )}
                      {facility.specialties && facility.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {facility.specialties.slice(0, 3).map((specialty, index) => (
                            <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Button
                      onClick={() => handleCall(facility.phone)}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button
                      onClick={() => handleDirections(facility)}
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    {facility.type !== 'emergency' && (
                      <Button
                        onClick={() => handleBookAppointment(facility)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Book Appointment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFacilities.length === 0 && (
          <Card className="shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or expanding your search area.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Additional Resources */}
        <Card className="shadow-sm border-0 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">24/7 Nurse Hotline</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Get medical advice from registered nurses anytime.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:1-800-NURSE-4U')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Hotline
                </Button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Telemedicine Options</h4>
                <p className="text-sm text-green-700 mb-3">
                  Connect with healthcare providers virtually.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TriageResources;
