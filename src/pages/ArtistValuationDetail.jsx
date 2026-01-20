import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Save, Calculator, TrendingUp, Music, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const ArtistValuationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const artistData = location.state?.artist;

  // Extract stream data from different platforms
  const getStreamData = () => {
    if (!artistData) return { totalStreams: 0, hasRealData: false };

    // Priority 1: Apify data (most accurate)
    if (artistData.platform === 'apify' && artistData.stats?.totalStreams) {
      const streamsStr = artistData.stats.totalStreams;
      let streams = 0;
      if (streamsStr.includes('B')) {
        streams = parseFloat(streamsStr.replace('B', '')) * 1000000000;
      } else if (streamsStr.includes('M')) {
        streams = parseFloat(streamsStr.replace('M', '')) * 1000000;
      } else if (streamsStr.includes('K')) {
        streams = parseFloat(streamsStr.replace('K', '')) * 1000;
      } else {
        streams = parseFloat(streamsStr.replace(/,/g, ''));
      }
      return { totalStreams: streams, hasRealData: true };
    }

    // Priority 2: Calculate from top tracks if available
    if (artistData.topTracks && artistData.topTracks.length > 0) {
      let totalFromTracks = 0;
      artistData.topTracks.forEach(track => {
        if (track.streamCount) {
          totalFromTracks += parseInt(track.streamCount);
        } else if (track.streamCountFormatted) {
          const countStr = track.streamCountFormatted;
          if (countStr.includes('B')) {
            totalFromTracks += parseFloat(countStr.replace('B', '')) * 1000000000;
          } else if (countStr.includes('M')) {
            totalFromTracks += parseFloat(countStr.replace('M', '')) * 1000000;
          } else if (countStr.includes('K')) {
            totalFromTracks += parseFloat(countStr.replace('K', '')) * 1000;
          }
        } else if (track.popularity && artistData.followers) {
          const followerNum = parseFloat(String(artistData.followers).replace(/[^0-9.]/g, ''));
          totalFromTracks += (track.popularity / 100) * followerNum * 100;
        }
      });
      if (totalFromTracks > 0) {
        return { totalStreams: totalFromTracks, hasRealData: true };
      }
    }

    // Priority 3: Estimate from popularity and followers
    if (artistData.popularity && artistData.followers) {
      const followerNum = parseFloat(String(artistData.followers).replace(/[^0-9.]/g, ''));
      const popularityNum = parseInt(artistData.popularity) || 0;
      const estimatedStreams = followerNum * (popularityNum / 100) * 65;
      return { totalStreams: estimatedStreams, hasRealData: false };
    }

    // Priority 4: Use monthly listeners
    if (artistData.monthlyListeners) {
      const listenersNum = parseFloat(String(artistData.monthlyListeners).replace(/[^0-9.]/g, ''));
      const estimatedStreams = listenersNum * 15;
      return { totalStreams: estimatedStreams, hasRealData: false };
    }

    return { totalStreams: 7000000000, hasRealData: false };
  };

  const { totalStreams: initialStreams, hasRealData } = getStreamData();
  const [streamInput, setStreamInput] = useState(initialStreams.toString());
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!artistData) {
      navigate('/valuation');
    }
  }, [artistData, navigate]);

  if (!artistData) return null;

  const getFollowers = () => {
    if (!artistData.followers) return 0;
    const followerStr = String(artistData.followers);
    if (followerStr.includes('M')) {
      return parseFloat(followerStr.replace('M', '')) * 1000000;
    } else if (followerStr.includes('K')) {
      return parseFloat(followerStr.replace('K', '')) * 1000;
    }
    return parseFloat(followerStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const getMonthlyListeners = () => {
    if (!artistData.monthlyListeners) return 0;
    const listenerStr = String(artistData.monthlyListeners);
    if (listenerStr.includes('M')) {
      return parseFloat(listenerStr.replace('M', '')) * 1000000;
    } else if (listenerStr.includes('K')) {
      return parseFloat(listenerStr.replace('K', '')) * 1000;
    }
    return parseFloat(listenerStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const followers = getFollowers();
  const popularity = parseInt(artistData.popularity) || 70;
  const monthlyListeners = getMonthlyListeners();
  const totalStreams = parseFloat(streamInput.replace(/,/g, '')) || 0;

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatToBillions = (num) => {
    if (!num || isNaN(num)) return '0.00B';
    const billions = num / 1000000000;
    return billions.toFixed(2) + 'B';
  };

  const formatToMillions = (num) => {
    if (!num || isNaN(num)) return '0.00M';
    const millions = num / 1000000;
    return millions.toFixed(2) + 'M';
  };

  const avgStreamsPerTrack = totalStreams / 10;
  const revenuePerStream = 0.004;
  const ltmRevenue = totalStreams * revenuePerStream;
  const conservativeValuation = ltmRevenue * 6;
  const marketValuation = ltmRevenue * 8;
  const premiumValuation = ltmRevenue * 10;
  const popularityMultiplier = 1 + (popularity / 100) * 0.3;
  const estimatedValuation = marketValuation * popularityMultiplier;
  const recordingAdvance = ltmRevenue * 0.15;
  const tourSupport = ltmRevenue * 0.09;
  const marketingBudget = ltmRevenue * 0.06;
  const totalAdvancePackage = recordingAdvance + tourSupport + marketingBudget;
  const caccGrowth = popularity > 80 ? 0.30 : popularity > 60 ? 0.20 : 0.15;
  const growthAdjustedValue = marketValuation * (1 + caccGrowth);
  const adjustedValuation = growthAdjustedValue;

  const handleRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 500);
  };

  const handleSave = () => {
    const reportData = {
      artist: artistData.name,
      date: new Date().toISOString(),
      streams: totalStreams,
      valuation: estimatedValuation,
      ltmRevenue: ltmRevenue,
    };
    console.log('Saving report:', reportData);
    alert('Valuation report saved! (This would save to your database)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/valuation')}
            className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            Back to Search
          </Button>
          
          {hasRealData ? (
            <Badge variant="success" className="bg-emerald-500 text-white">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Real Stream Data from {artistData.platform === 'apify' ? 'Apify' : artistData.platform}
              </span>
            </Badge>
          ) : (
            <Badge variant="warning" className="bg-yellow-500 text-white">
              Estimated Data - Edit stream count below
            </Badge>
          )}
        </div>

        {/* Artist Header Card */}
        <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          <div className="relative z-10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Artist Image */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 shadow-2xl">
                  {artistData.image ? (
                    <img 
                      src={artistData.image} 
                      alt={artistData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                      <Music size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg">
                  <Music size={20} className="text-white" />
                </div>
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <Music size={20} className="text-emerald-400" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{artistData.name}</h1>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Spotify Financial & Market Valuation
                </p>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {/* Estimated Valuation */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <DollarSign size={20} className="text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/70">Estimated Valuation</p>
                        <h3 className="text-xl font-bold text-emerald-400">
                          ${formatToMillions(estimatedValuation)}
                        </h3>
                        <p className="text-xs text-emerald-400">
                          {hasRealData ? 'From real data' : 'Estimated'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engaged Fanbase */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Music size={20} className="text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/70">Engaged Fanbase</p>
                        <h3 className="text-xl font-bold text-white">{formatToMillions(followers)}</h3>
                        <p className="text-xs text-white/70">Followers</p>
                      </div>
                    </div>
                  </div>

                  {/* Top 10 Streams */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Music size={20} className="text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/70">Top 10 Total Streams</p>
                        <h3 className="text-xl font-bold text-white">{formatToBillions(totalStreams)}</h3>
                        <p className="text-xs text-emerald-400">
                          {hasRealData ? 'Real data' : 'Estimated'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Popularity Index */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <TrendingUp size={20} className="text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/70">Popularity Index</p>
                        <h3 className="text-xl font-bold text-white">{popularity}/100</h3>
                        <p className="text-xs text-white/70">vs Industry</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stream Valuation Input */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Music size={24} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stream Valuation Input</h2>
              {hasRealData && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ Using real data from {artistData.platform}</p>
              )}
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            {hasRealData 
              ? `Real total streams from ${artistData.platform} for the artist's top ${artistData.topTracks?.length || 10} tracks. Edit to refine the valuation.`
              : "Estimated total streams for the artist's top 10 tracks. Edit to use real data."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top 10 Total Streams
              </label>
              <input
                type="text"
                value={formatNumber(parseFloat(streamInput.replace(/,/g, '')))}
                onChange={(e) => setStreamInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="7,000,000,000"
              />
            </div>
            <Button
              icon={Save}
              onClick={handleRecalculate}
              className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
            >
              Save & Recalculate
            </Button>
          </div>
        </Card>

        {/* Per-Track Revenue Calculation */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calculator size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Per-Track Last Twelve Month Revenue Calculation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Streams (Top 10)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatToBillions(totalStreams)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Streams per Track</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatToMillions(avgStreamsPerTrack)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Tracks</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">10</p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-6 text-center">
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2 font-semibold">Total LTM Revenue (Top 10)</p>
            <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">${formatToMillions(ltmRevenue)}</p>
          </div>
        </Card>

        {/* Professional Valuation Ranges */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Valuation Ranges</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conservative */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-200 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Conservative (6x Revenue)</h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                ${formatToMillions(conservativeValuation)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Traditional industry standard</p>
            </div>

            {/* Market Standard */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg shadow-emerald-200 dark:shadow-emerald-500/20">
              <div className="w-16 h-16 bg-emerald-200 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Market Standard (8x Revenue)</h3>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                ${formatToMillions(marketValuation)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current market average</p>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-purple-200 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Premium (10x Revenue)</h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                ${formatToMillions(premiumValuation)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">High-growth potential artists</p>
            </div>
          </div>
        </Card>

        {/* Advance Potential & Growth Adjusted */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advance Potential */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Music size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advance Potential</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300">Recording Advance</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${formatToMillions(recordingAdvance)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300">Tour Support</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${formatToMillions(tourSupport)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300">Marketing Budget</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${formatToMillions(marketingBudget)}
                </span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Total Package</span>
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    ${formatToMillions(totalAdvancePackage)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Growth-Adjusted Valuation */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Growth-Adjusted Valuation</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300">Base 8x Valuation</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatToMillions(marketValuation)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-700 dark:text-gray-300">CACC Growth (+{(caccGrowth * 100).toFixed(0)}%)</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  +${formatToMillions(growthAdjustedValue - marketValuation)}
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Adjusted Valuation</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${formatToMillions(adjustedValuation)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Report Button */}
        <div className="flex justify-center pt-6">
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg shadow-emerald-500/30 px-8"
          >
            Save Valuation Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistValuationDetail;