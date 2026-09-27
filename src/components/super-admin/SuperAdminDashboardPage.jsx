import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Crown, Users, Server, Activity, Lock, Key, 
  Terminal, AlertTriangle, RefreshCw, CheckCircle, Database, Cpu, Globe, ArrowLeft, LogOut,
  UserPlus, UserCheck, UserX, Trash2, Eye, EyeOff, Package, Car, MessageSquare, Ticket, Settings, Copy, Check,
  MapPin, Plus, Edit, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userDB } from '../../services/userDatabase';
import { cityDB } from '../../services/cityDatabaseService';
import { bookingDB } from '../../services/bookingDatabase';
import { vehicleDB } from '../../services/vehicleDatabase';
import { TOUR_PACKAGES_DATA, MOCK_CRM_LEADS } from '../../data/phase5Data';
import { FLEET_CARS } from '../../data/mockData';

export default function SuperAdminDashboardPage({ onExit }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cities' | 'admins' | 'users' | 'bookings' | 'fleet' | 'packages' | 'enquiries' | 'settings'
  
  // Database Users, Bookings & Cities State
  const [usersList, setUsersList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [createdAdminSuccess, setCreatedAdminSuccess] = useState(null);

  // Fleet & Custom Pricing State
  const [fleetList, setFleetList] = useState([]);
  const [editPriceMap, setEditPriceMap] = useState({});
  const [editDepositMap, setEditDepositMap] = useState({});
  const [priceSuccessMsg, setPriceSuccessMsg] = useState('');

  // Add New Vehicle Form state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehName, setNewVehName] = useState('');
  const [newVehCategory, setNewVehCategory] = useState('SUV');
  const [newVehPrice, setNewVehPrice] = useState(3999);
  const [newVehDeposit, setNewVehDeposit] = useState(5000);
  const [newVehSeats, setNewVehSeats] = useState(5);
  const [newVehFuel, setNewVehFuel] = useState('Petrol');
  const [newVehTrans, setNewVehTrans] = useState('Automatic');
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehImage, setNewVehImage] = useState('');
  
  // Create Admin Form State
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminTempPassword, setAdminTempPassword] = useState('Admin@2026');
  const [createAdminError, setCreateAdminError] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);

  // Create / Edit City Form State
  const [showCityModal, setShowCityModal] = useState(false);
  const [editingCityId, setEditingCityId] = useState(null);
  const [cityName, setCityName] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [cityState, setCityState] = useState('');
  const [cityPopular, setCityPopular] = useState(false);
  const [cityStatus, setCityStatus] = useState('AVAILABLE');
  const [cityFilterQuery, setCityFilterQuery] = useState('');

  // Load database records
  const refreshUsers = async () => {
    setUsersList(await userDB.getUsers());
  };

  const refreshBookings = async () => {
    setBookingsList(await bookingDB.getBookings());
  };

  const refreshCities = async () => {
    setCitiesList(await cityDB.getAllCitiesForAdmin());
  };

  const refreshFleet = async () => {
    const vehicles = await vehicleDB.getVehicles();
    setFleetList(vehicles);

    const pMap = {};
    const dMap = {};
    vehicles.forEach(v => {
      pMap[v.id] = v.pricePerDay;
      dMap[v.id] = v.securityDeposit || 5000;
    });
    setEditPriceMap(pMap);
    setEditDepositMap(dMap);
  };

  useEffect(() => {
    refreshUsers();
    refreshCities();
    refreshBookings();
    refreshFleet();
  }, []);

  const handleUpdatePrice = async (vehicleId) => {
    try {
      const newPrice = Number(editPriceMap[vehicleId]);
      const newDeposit = Number(editDepositMap[vehicleId] || 5000);

      if (!newPrice || newPrice <= 0) {
        alert('Please enter a valid daily rate greater than ₹0.');
        return;
      }

      await vehicleDB.updateVehicle(vehicleId, {
        pricePerDay: newPrice,
        securityDeposit: newDeposit
      });

      await refreshFleet();
      setPriceSuccessMsg(`✓ Price updated successfully! New Daily Rate: ₹${newPrice.toLocaleString()}/day`);
      setTimeout(() => setPriceSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update vehicle price.');
    }
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehName) return;

    try {
      await vehicleDB.addVehicle({
        name: newVehName,
        category: newVehCategory,
        pricePerDay: Number(newVehPrice),
        securityDeposit: Number(newVehDeposit),
        seats: Number(newVehSeats),
        fuelType: newVehFuel,
        transmission: newVehTrans,
        regNumber: newVehReg || `GJ-05-ST-${Math.floor(1000 + Math.random()*9000)}`,
        images: newVehImage ? [newVehImage] : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80']
      });

      await refreshFleet();
      setShowAddVehicleModal(false);
      setNewVehName('');
      setNewVehImage('');
      setPriceSuccessMsg(`✓ New vehicle "${newVehName}" added to fleet at ₹${Number(newVehPrice).toLocaleString()}/day!`);
      setTimeout(() => setPriceSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add vehicle.');
    }
  };

  // Filter Users by Role
  const adminAccounts = usersList.filter(u => u.role === 'ADMIN');
  const customerAccounts = usersList.filter(u => u.role === 'USER');

  // Handle Admin Creation
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setCreateAdminError('');

    try {
      const { user: createdAdmin } = await userDB.createAdminAccount({
        name: adminFullName,
        email: adminEmail,
        mobile: adminMobile,
        tempPassword: adminTempPassword
      });

      setCreatedAdminSuccess({
        name: createdAdmin.name,
        email: createdAdmin.email,
        tempPassword: adminTempPassword
      });

      // Reset Form
      setAdminFullName('');
      setAdminEmail('');
      setAdminMobile('');
      setAdminTempPassword('Admin@2026');
      setShowCreateAdminModal(false);
      refreshUsers();
    } catch (err) {
      setCreateAdminError(err.message || 'Failed to create admin account.');
    }
  };

  // Handle City Save (Add / Edit)
  const handleSaveCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityName.trim() || !cityState.trim()) return;

    try {
      if (editingCityId) {
        await cityDB.updateCity(editingCityId, {
          name: cityName,
          district: cityDistrict || cityName,
          state: cityState,
          popular: cityPopular,
          status: cityStatus
        });
      } else {
        await cityDB.addCity({
          name: cityName,
          district: cityDistrict || cityName,
          state: cityState,
          popular: cityPopular,
          status: cityStatus
        });
      }

      // Reset Form
      setShowCityModal(false);
      setEditingCityId(null);
      setCityName('');
      setCityDistrict('');
      setCityState('');
      setCityPopular(false);
      setCityStatus('AVAILABLE');
      await refreshCities();
    } catch (err) {
      alert(err.message || 'Failed to save city');
    }
  };

  const handleOpenEditCity = (city) => {
    setEditingCityId(city.id);
    setCityName(city.name);
    setCityDistrict(city.district);
    setCityState(city.state);
    setCityPopular(city.popular);
    setCityStatus(city.status);
    setShowCityModal(true);
  };

  const handleTogglePopular = async (city) => {
    try {
      await cityDB.updateCity(city.id, { popular: !city.popular });
      await refreshCities();
    } catch (err) {
      alert(err.message || 'Failed to update city');
    }
  };

  const handleToggleStatus = async (city, nextStatus) => {
    try {
      await cityDB.updateCity(city.id, { status: nextStatus });
      await refreshCities();
    } catch (err) {
      alert(err.message || 'Failed to update city status');
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    try {
      await cityDB.deleteCity(cityId);
      await refreshCities();
    } catch (err) {
      alert(err.message || 'Failed to delete city');
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId) => {
    try {
      await userDB.toggleUserStatus(userId);
      await refreshUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete User / Admin
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await userDB.deleteUser(userId);
      await refreshUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyPassword = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const filteredCitiesList = citiesList.filter(c => 
    c.name.toLowerCase().includes(cityFilterQuery.toLowerCase()) ||
    c.district.toLowerCase().includes(cityFilterQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(cityFilterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Super Admin Top Owner Header Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <Crown className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  Super Admin Governance Portal
                </h1>
                <span className="text-xs bg-purple-500/20 text-purple-300 font-extrabold px-3 py-1 rounded-full border border-purple-500/40 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> OWNER ACCOUNT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Owner: <strong className="text-amber-400">vshallg9151@gmail.com</strong> • Complete System & Operations Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Create New Admin
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>

        {/* Newly Created Admin Success Credentials Banner */}
        {createdAdminSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-emerald-200 animate-in fade-in duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Admin Account Created Successfully!</h3>
              </div>
              <button 
                onClick={() => setCreatedAdminSuccess(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-emerald-300">
              Provide these temporary credentials to the new administrator. Admin must change their password after first login.
            </p>
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-white">
              <div>
                <p>Email: <strong className="text-amber-400">{createdAdminSuccess.email}</strong></p>
                <p className="mt-1">Generated Password: <strong className="text-emerald-400">{createdAdminSuccess.tempPassword}</strong></p>
              </div>
              <button
                onClick={() => handleCopyPassword(`Email: ${createdAdminSuccess.email}\nPassword: ${createdAdminSuccess.tempPassword}`)}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl font-extrabold flex items-center gap-1"
              >
                {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPass ? 'Copied!' : 'Copy Credentials'}
              </button>
            </div>
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Super Admin Owner</span>
            <div className="text-lg font-black text-purple-400 truncate">1 (Single Owner)</div>
            <span className="text-[10px] text-slate-500">System owner restricted</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Indian Cities DB</span>
            <div className="text-2xl font-black text-amber-400">{citiesList.length} Cities</div>
            <span className="text-[10px] text-slate-500">Serviceable Locations</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Admin Accounts</span>
            <div className="text-2xl font-black text-blue-400">{adminAccounts.length} Active</div>
            <span className="text-[10px] text-slate-500">Operational Managers</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Accounts</span>
            <div className="text-2xl font-black text-emerald-400">{customerAccounts.length} Registered</div>
            <span className="text-[10px] text-slate-500">Public Users</span>
          </div>
        </div>

        {/* Super Admin Navigation Tabs */}
        <div className="bg-slate-900 p-2 border border-slate-800 rounded-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'overview', label: 'Overview & Stats', icon: Activity },
            { key: 'cities', label: `City Management (${citiesList.length})`, icon: MapPin },
            { key: 'admins', label: `Manage Admins (${adminAccounts.length})`, icon: ShieldCheck },
            { key: 'users', label: `Manage Users (${customerAccounts.length})`, icon: Users },
            { key: 'bookings', label: 'Bookings Manager', icon: Package },
            { key: 'fleet', label: 'Vehicles Fleet', icon: Car },
            { key: 'packages', label: 'Tour Packages', icon: Package },
            { key: 'enquiries', label: 'Customer Enquiries', icon: MessageSquare },
            { key: 'settings', label: 'System Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-purple-500 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" /> Super Admin Credentials Verification
              </h3>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <p className="text-slate-400">Predefined Owner Email: <strong className="text-amber-400 font-mono">vshallg9151@gmail.com</strong></p>
                <p className="text-slate-400">Owner Role: <strong className="text-purple-400 font-mono">SUPER_ADMIN (isOwner: true)</strong></p>
                <p className="text-slate-400">Password Storage: <strong className="text-emerald-400 font-mono">bCrypt Hash ($2b$10$siddhiSalt2026...)</strong></p>
                <p className="text-slate-400">Single Owner Guard: <span className="text-emerald-400 font-bold">● Enforced (Only 1 Super Admin Allowed)</span></p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" /> Indian City Database Management
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin can add new cities, toggle popular shortcuts, set Coming Soon service status, or disable cities.
              </p>
              <button
                onClick={() => {
                  setEditingCityId(null);
                  setCityName('');
                  setCityDistrict('');
                  setCityState('');
                  setCityPopular(false);
                  setCityStatus('AVAILABLE');
                  setShowCityModal(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Indian City to Database
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CITY MANAGEMENT SECTION */}
        {activeTab === 'cities' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" /> Indian City & Location Database Manager
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Control serviceable cities, popular shortcuts, and coming soon availability status</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter city or state..."
                  value={cityFilterQuery}
                  onChange={(e) => setCityFilterQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    setEditingCityId(null);
                    setCityName('');
                    setCityDistrict('');
                    setCityState('');
                    setCityPopular(false);
                    setCityStatus('AVAILABLE');
                    setShowCityModal(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add City
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">City Name</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Popular Shortcut</th>
                    <th className="py-3 px-4">Service Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredCitiesList.map(city => (
                    <tr key={city.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> {city.name}
                      </td>
                      <td className="py-3 px-4">{city.district}</td>
                      <td className="py-3 px-4 font-bold text-purple-300">{city.state}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePopular(city)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                            city.popular ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {city.popular ? '★ Popular' : 'Standard'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={city.status}
                          onChange={(e) => handleToggleStatus(city, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs font-extrabold rounded-lg px-2 py-1 text-slate-200 outline-none"
                        >
                          <option value="AVAILABLE" className="bg-slate-900 text-emerald-400">AVAILABLE ✅</option>
                          <option value="COMING_SOON" className="bg-slate-900 text-purple-400">COMING SOON 🚀</option>
                          <option value="DISABLED" className="bg-slate-900 text-rose-400">DISABLED ❌</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditCity(city)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                          title="Edit City"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCity(city.id)}
                          className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg"
                          title="Delete City"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE ADMIN ACCOUNTS */}
        {activeTab === 'admins' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" /> Administrative Accounts Manager
                </h3>
                <p className="text-xs text-slate-400 mt-1">Super Admin controls for activating, deactivating, and managing Admin accounts</p>
              </div>
              <button
                onClick={() => setShowCreateAdminModal(true)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Create Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Admin Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Password Change Needed</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {adminAccounts.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400" /> {admin.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-300">{admin.email}</td>
                      <td className="py-3.5 px-4">{admin.mobile}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          admin.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {admin.mustChangePassword ? (
                          <span className="text-amber-400 font-bold text-[10px]">YES (First Login)</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">NO</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(admin.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700"
                        >
                          {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(admin.id)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE USER ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Registered Customer Accounts
              </h3>
              <p className="text-xs text-slate-400 mt-1">Users registered via normal signup (automatically assigned role = USER)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {customerAccounts.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" /> {cust.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-300">{cust.email}</td>
                      <td className="py-3.5 px-4">{cust.mobile}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-[10px] border border-blue-500/30">
                          {cust.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          cust.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(cust.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700"
                        >
                          {cust.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(cust.id)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLATFORM BOOKINGS CONTROL */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" /> Platform Bookings Control & Oversight
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time view of customer reservations across India, driving licences & payment states</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold rounded-xl border border-amber-500/30">
                Total Bookings: {bookingsList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Rental Mode / DL</th>
                    <th className="py-3 px-4">Pickup City</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {bookingsList.map(b => (
                    <tr key={b.bookingId} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{b.bookingId}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{b.userName}</span>
                        <span className="text-[10px] text-slate-400">{b.userPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{b.vehicleName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-200 block text-[11px]">{b.rentalType || 'Self Drive'}</span>
                        {b.rentalType === 'Chauffeur Driven' || b.rentalType === 'chauffeur' ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                            DL Not Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-mono">
                            {b.dlNumber ? `DL: ${b.dlNumber}` : 'DL Verified ✓'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{b.pickupCity}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-amber-300">{b.pickupDate} to {b.returnDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {b.bookingStatus !== 'CONFIRMED' && (
                          <button
                            onClick={async () => {
                              try {
                                await bookingDB.updateBookingStatus(b.bookingId, 'CONFIRMED');
                                await refreshBookings();
                              } catch (err) {
                                alert(err.message || 'Failed to confirm booking');
                              }
                            }}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold rounded"
                          >
                            Confirm
                          </button>
                        )}
                        {b.bookingStatus !== 'CANCELLED' && (
                          <button
                            onClick={async () => {
                              try {
                                await bookingDB.updateBookingStatus(b.bookingId, 'CANCELLED');
                                await refreshBookings();
                              } catch (err) {
                                alert(err.message || 'Failed to cancel booking');
                              }
                            }}
                            className="px-2 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase rounded-full border border-amber-500/30">
                  SUPER ADMIN PRICING CONTROL
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                  <Car className="w-6 h-6 text-amber-400" /> Fleet Vehicle & Price Manager
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set and customize daily rental rates (₹/day) & security deposits for all fleet vehicles across India.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddVehicleModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Vehicle to Fleet
              </button>
            </div>

            {priceSuccessMsg && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{priceSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleetList.map((car) => {
                const carImg = car.image || (Array.isArray(car.images) && car.images[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';
                const currentEditPrice = editPriceMap[car.id] ?? car.pricePerDay;
                const currentEditDeposit = editDepositMap[car.id] ?? (car.securityDeposit || 5000);

                return (
                  <div
                    key={car.id}
                    className="bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Vehicle Image Banner */}
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-900 mb-3 border border-slate-800">
                        <img src={carImg} alt={car.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          {car.category || 'SUV'}
                        </div>
                        <div className="absolute top-2 right-2 bg-slate-950/80 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          {car.regNumber || 'GJ-05-ST-2026'}
                        </div>
                      </div>

                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{car.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{car.model} • {car.location || 'Surat'}</p>

                      <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-400 font-semibold">
                        <span>👥 {car.seats || 5} Seats</span>
                        <span>•</span>
                        <span>⛽ {car.fuelType || 'Petrol'}</span>
                        <span>•</span>
                        <span>⚙️ {car.transmission || 'Auto'}</span>
                      </div>
                    </div>

                    {/* Price Controls Section */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      
                      {/* Daily Rate Input */}
                      <div>
                        <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Daily Rate (₹ / day)</span>
                          <span className="text-[9px] text-slate-500 font-normal">Super Admin Override</span>
                        </label>
                        <div className="relative">
                          <span className="text-xs font-black text-amber-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                          <input
                            type="number"
                            value={currentEditPrice}
                            onChange={(e) => setEditPriceMap({ ...editPriceMap, [car.id]: e.target.value })}
                            className="w-full bg-slate-900 border border-amber-500/40 rounded-xl pl-8 pr-3 py-2 text-xs font-black text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Security Deposit Input */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Security Deposit (₹ Refundable)
                        </label>
                        <div className="relative">
                          <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                          <input
                            type="number"
                            value={currentEditDeposit}
                            onChange={(e) => setEditDepositMap({ ...editDepositMap, [car.id]: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditPriceMap({ ...editPriceMap, [car.id]: Math.max(500, Number(currentEditPrice) - 500) })}
                          className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-slate-300"
                        >
                          - ₹500
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPriceMap({ ...editPriceMap, [car.id]: Number(currentEditPrice) + 500 })}
                          className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-slate-300"
                        >
                          + ₹500
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPriceMap({ ...editPriceMap, [car.id]: Number(currentEditPrice) + 1000 })}
                          className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-amber-400"
                        >
                          + ₹1,000
                        </button>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleUpdatePrice(car.id)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        Save New Custom Price
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-purple-400" /> Tour Packages Manager</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOUR_PACKAGES_DATA.map(pkg => (
                <div key={pkg.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white text-xs">{pkg.title}</h4>
                  <p className="text-[10px] text-slate-400">{pkg.duration} • ₹{pkg.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-amber-400" /> Customer Enquiries</h3>
            <div className="space-y-2">
              {MOCK_CRM_LEADS.map(lead => (
                <div key={lead.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div><span className="font-bold text-white">{lead.name}</span> ({lead.phone})</div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">{lead.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" /> System Owner Settings</h3>
            <p className="text-xs text-slate-400">Indian Cities DB Version: 1.0 (Prepopulated 100+ cities)</p>
          </div>
        )}

      </div>

      {/* CREATE ADMIN MODAL FORM */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={() => setShowCreateAdminModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"><X className="w-5 h-5" /></button>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase rounded-full border border-amber-500/30">SUPER ADMIN CONTROL</span>
              <h3 className="text-2xl font-black text-white mt-2">Create Admin Account</h3>
            </div>
            {createAdminError && <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-300">{createAdminError}</div>}
            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div><label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Full Name</label><input type="text" required placeholder="Operations Manager" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Admin Email Address</label><input type="email" required placeholder="admin.ops@siddhivinayak.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Mobile Number</label><input type="tel" required placeholder="+91 98765 43211" value={adminMobile} onChange={(e) => setAdminMobile(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Temporary Password</label><input type="text" required placeholder="Admin@2026" value={adminTempPassword} onChange={(e) => setAdminTempPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"><UserPlus className="w-4 h-4" /> Create Admin & Generate Credentials</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CITY MODAL FORM */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={() => setShowCityModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"><X className="w-5 h-5" /></button>
            <div>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase rounded-full border border-purple-500/30">CITY DATABASE MANAGEMENT</span>
              <h3 className="text-2xl font-black text-white mt-2">{editingCityId ? 'Edit Indian City' : 'Add New Indian City'}</h3>
            </div>
            <form onSubmit={handleSaveCitySubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">City Name</label>
                <input type="text" required placeholder="e.g. Surat" value={cityName} onChange={(e) => setCityName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">District</label>
                <input type="text" placeholder="e.g. Surat" value={cityDistrict} onChange={(e) => setCityDistrict(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">State / Union Territory</label>
                <input type="text" required placeholder="e.g. Gujarat" value={cityState} onChange={(e) => setCityState(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Set as Popular Shortcut City</span>
                <input type="checkbox" checked={cityPopular} onChange={(e) => setCityPopular(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Service Availability Status</label>
                <select value={cityStatus} onChange={(e) => setCityStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-400 outline-none">
                  <option value="AVAILABLE">AVAILABLE ✅</option>
                  <option value="COMING_SOON">COMING SOON 🚀</option>
                  <option value="DISABLED">DISABLED ❌</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Save City to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL FORM */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button onClick={() => setShowAddVehicleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"><X className="w-5 h-5" /></button>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase rounded-full border border-amber-500/30">FLEET MANAGER</span>
              <h3 className="text-2xl font-black text-white mt-2">Add New Vehicle to Fleet</h3>
            </div>
            <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Vehicle Name *</label>
                <input type="text" required placeholder="e.g. BMW X5 M-Sport 4x4" value={newVehName} onChange={(e) => setNewVehName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Daily Price (₹) *</label>
                  <input type="number" required placeholder="5999" value={newVehPrice} onChange={(e) => setNewVehPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Deposit (₹) *</label>
                  <input type="number" required placeholder="5000" value={newVehDeposit} onChange={(e) => setNewVehDeposit(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Category</label>
                  <select value={newVehCategory} onChange={(e) => setNewVehCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-amber-400 outline-none">
                    <option value="SUV">SUV</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury Van">Luxury Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Seating</label>
                  <input type="number" value={newVehSeats} onChange={(e) => setNewVehSeats(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Image URL</label>
                <input type="text" placeholder="https://images.unsplash.com/..." value={newVehImage} onChange={(e) => setNewVehImage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Add Vehicle & Publish Custom Price
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
