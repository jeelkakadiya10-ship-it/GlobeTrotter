import React, { useState, useEffect } from 'react';
import { Plane, Hotel, ExternalLink, Plus, Trash2, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { useCurrency } from '../context/CurrencyContext';

export interface FlightItem {
  id: string;
  airline: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
}

export interface StayItem {
  id: string;
  hotelName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  totalNights: number;
}

interface FlightStaySectionProps {
  tripId: number | string;
  availableCities?: string[];
  onCostChange?: () => void;
}

export const FlightStaySection: React.FC<FlightStaySectionProps> = ({
  tripId,
  availableCities = [],
  onCostChange
}) => {
  const { formatPrice } = useCurrency();

  const storageKeyFlights = `globetrotter_flights_${tripId}`;
  const storageKeyStays = `globetrotter_stays_${tripId}`;

  const [flights, setFlights] = useState<FlightItem[]>(() => {
    const saved = localStorage.getItem(storageKeyFlights);
    return saved ? JSON.parse(saved) : [];
  });

  const [stays, setStays] = useState<StayItem[]>(() => {
    const saved = localStorage.getItem(storageKeyStays);
    return saved ? JSON.parse(saved) : [];
  });

  // Modals state
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [stayModalOpen, setStayModalOpen] = useState(false);

  // Flight form state
  const [airline, setAirline] = useState('Air India');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightTime, setFlightTime] = useState('08:30');
  const [flightPrice, setFlightPrice] = useState('180');

  // Stay form state
  const [hotelName, setHotelName] = useState('');
  const [stayCity, setStayCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [pricePerNight, setPricePerNight] = useState('95');

  useEffect(() => {
    localStorage.setItem(storageKeyFlights, JSON.stringify(flights));
    if (onCostChange) onCostChange();
  }, [flights, storageKeyFlights]);

  useEffect(() => {
    localStorage.setItem(storageKeyStays, JSON.stringify(stays));
    if (onCostChange) onCostChange();
  }, [stays, storageKeyStays]);

  // Goibibo Link Builders
  const buildGoibiboFlightUrl = (flight: FlightItem) => {
    // Format date as DDMMYYYY
    let dateFormatted = '20260915';
    if (flight.date) {
      const [y, m, d] = flight.date.split('-');
      if (y && m && d) {
        dateFormatted = `${d}${m}${y}`;
      }
    }
    const origin = encodeURIComponent(flight.from.trim().replace(/\s+/g, '-').toUpperCase() || 'DEL');
    const dest = encodeURIComponent(flight.to.trim().replace(/\s+/g, '-').toUpperCase() || 'BOM');
    return `https://www.goibibo.com/flights/air-${origin}-${dest}-${dateFormatted}/`;
  };

  const buildGoibiboHotelUrl = (stay: StayItem) => {
    const citySlug = encodeURIComponent(stay.city.trim().toLowerCase().replace(/\s+/g, '-') || 'paris');
    let checkinParam = '';
    let checkoutParam = '';
    if (stay.checkIn) checkinParam = `checkin=${stay.checkIn.replace(/-/g, '')}`;
    if (stay.checkOut) checkoutParam = `&checkout=${stay.checkOut.replace(/-/g, '')}`;

    return `https://www.goibibo.com/hotels/hotels-in-${citySlug}/?${checkinParam}${checkoutParam}`;
  };

  const handleAddFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity || !toCity || !flightDate) return;

    const newFlight: FlightItem = {
      id: Math.random().toString(36).substring(2, 9),
      airline: airline.trim() || 'Flight Partner',
      from: fromCity.trim(),
      to: toCity.trim(),
      date: flightDate,
      time: flightTime,
      price: Number(flightPrice) || 0,
    };

    setFlights([...flights, newFlight]);
    setFlightModalOpen(false);
    setFromCity('');
    setToCity('');
    setFlightDate('');
  };

  const handleAddStay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !stayCity || !checkIn || !checkOut) return;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const newStay: StayItem = {
      id: Math.random().toString(36).substring(2, 9),
      hotelName: hotelName.trim(),
      city: stayCity.trim(),
      checkIn,
      checkOut,
      pricePerNight: Number(pricePerNight) || 0,
      totalNights: nights,
    };

    setStays([...stays, newStay]);
    setStayModalOpen(false);
    setHotelName('');
    setStayCity('');
    setCheckIn('');
    setCheckOut('');
  };

  const handleDeleteFlight = (id: string) => {
    setFlights(flights.filter((f) => f.id !== id));
  };

  const handleDeleteStay = (id: string) => {
    setStays(stays.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Flights Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Flights & Transit</h3>
              <p className="text-xs text-slate-500">Track air travel and book with pre-filled Goibibo search</p>
            </div>
          </div>

          <button
            onClick={() => setFlightModalOpen(true)}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Flight
          </button>
        </div>

        {flights.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No flights added yet. Add a flight to connect your destinations.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="p-5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                      {flight.airline}
                    </span>
                    <div className="flex items-center gap-2 text-base font-black text-slate-900 mt-2">
                      <span>{flight.from}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span>{flight.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(flight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {flight.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Est. Price</p>
                    <p className="text-base font-black text-blue-600">{formatPrice(flight.price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <a
                    href={buildGoibiboFlightUrl(flight)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <span>Book on Goibibo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteFlight(flight.id)}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                    title="Delete flight"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stays Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Hotels & Stays</h3>
              <p className="text-xs text-slate-500">Manage accommodation bookings and link to Goibibo hotel search</p>
            </div>
          </div>

          <button
            onClick={() => setStayModalOpen(true)}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Stay
          </button>
        </div>

        {stays.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No accommodation added yet. Plan your hotel or resort stays.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stays.map((stay) => (
              <div
                key={stay.id}
                className="p-5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                      {stay.city}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-2 leading-tight">{stay.hotelName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{new Date(stay.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(stay.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>({stay.totalNights} {stay.totalNights === 1 ? 'night' : 'nights'})</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">{formatPrice(stay.pricePerNight)} / night</p>
                    <p className="text-base font-black text-purple-600">{formatPrice(stay.pricePerNight * stay.totalNights)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <a
                    href={buildGoibiboHotelUrl(stay)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <span>Book on Goibibo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteStay(stay.id)}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                    title="Delete stay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Flight Modal */}
      <Modal
        isOpen={flightModalOpen}
        onClose={() => setFlightModalOpen(false)}
        title="Add Flight Details"
      >
        <form onSubmit={handleAddFlight} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Airline / Flight Name
            </label>
            <input
              type="text"
              required
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              placeholder="e.g. Air India, Emirates, IndiGo, Lufthansa"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                From (Origin City) *
              </label>
              <input
                type="text"
                required
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="e.g. Mumbai, New Delhi, London"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                To (Destination City) *
              </label>
              <input
                type="text"
                required
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="e.g. Paris, Tokyo, Dubai"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Flight Date *
              </label>
              <input
                type="date"
                required
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Departure Time
              </label>
              <input
                type="time"
                value={flightTime}
                onChange={(e) => setFlightTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Estimated Price (in USD base)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={flightPrice}
              onChange={(e) => setFlightPrice(e.target.value)}
              placeholder="e.g. 250"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFlightModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow"
            >
              Save Flight
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Stay Modal */}
      <Modal
        isOpen={stayModalOpen}
        onClose={() => setStayModalOpen(false)}
        title="Add Hotel or Stay Details"
      >
        <form onSubmit={handleAddStay} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Hotel / Property Name *
            </label>
            <input
              type="text"
              required
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="e.g. Grand Palace Hotel, Cozy Boutique Airbnb"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              City / Location *
            </label>
            <input
              type="text"
              required
              value={stayCity}
              onChange={(e) => setStayCity(e.target.value)}
              placeholder="e.g. Paris, Rome, Kyoto"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Price per Night (in USD base)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStayModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow"
            >
              Save Stay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};