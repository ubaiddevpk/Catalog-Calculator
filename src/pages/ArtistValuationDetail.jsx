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
      // Remove 'B', 'M', 'K' and convert to number
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
        // For Apify tracks with streamCount
        if (track.streamCount) {
          totalFromTracks += parseInt(track.streamCount);
        }
        // For Apify tracks with streamCountFormatted
        else if (track.streamCountFormatted) {
          const countStr = track.streamCountFormatted;
          if (countStr.includes('B')) {
            totalFromTracks += parseFloat(countStr.replace('B', '')) * 1000000000;
          } else if (countStr.includes('M')) {
            totalFromTracks += parseFloat(countStr.replace('M', '')) * 1000000;
          } else if (countStr.includes('K')) {
            totalFromTracks += parseFloat(countStr.replace('K', '')) * 1000;
          }
        }
        // For Spotify/YouTube - estimate from popularity
        else if (track.popularity && artistData.followers) {
          const followerNum = parseFloat(String(artistData.followers).replace(/[^0-9.]/g, ''));
          // Rough estimate: popularity * followers * 100
          totalFromTracks += (track.popularity / 100) * followerNum * 100;
        }
      });
      if (totalFromTracks > 0) {
        return { totalStreams: totalFromTracks, hasRealData: true };
      }
    }

    // Priority 3: Estimate from popularity and followers (Spotify/YouTube)
    if (artistData.popularity && artistData.followers) {
      const followerNum = parseFloat(String(artistData.followers).replace(/[^0-9.]/g, ''));
      const popularityNum = parseInt(artistData.popularity) || 0;
      // Rough formula: followers * popularity factor * track multiplier
      const estimatedStreams = followerNum * (popularityNum / 100) * 65;
      return { totalStreams: estimatedStreams, hasRealData: false };
    }

    // Priority 4: Use monthly listeners (Apify specific)
    if (artistData.monthlyListeners) {
      const listenersNum = parseFloat(String(artistData.monthlyListeners).replace(/[^0-9.]/g, ''));
      // Assume average listener plays top 10 tracks ~15 times total
      const estimatedStreams = listenersNum * 15;
      return { totalStreams: estimatedStreams, hasRealData: false };
    }

    // Default fallback
    return { totalStreams: 7000000000, hasRealData: false };
  };

  const { totalStreams: initialStreams, hasRealData } = getStreamData();
  const [streamInput, setStreamInput] = useState(initialStreams.toString());
  const [isCalculating, setIsCalculating] = useState(false);

  // Redirect if no artist data
  useEffect(() => {
    if (!artistData) {
      navigate('/valuation');
    }
  }, [artistData, navigate]);

  if (!artistData) return null;

  // Extract relevant data from all platforms
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
  const popularity = parseInt(artistData.popularity) || 70; // Default to 70 if not available
  const monthlyListeners = getMonthlyListeners();

  // Calculate streams (use actual or user input)
  const totalStreams = parseFloat(streamInput.replace(/,/g, '')) || 0;

  // Format number with commas
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format to billions
  const formatToBillions = (num) => {
    if (!num || isNaN(num)) return '0.00B';
    const billions = num / 1000000000;
    return billions.toFixed(2) + 'B';
  };

  // Format to millions
  const formatToMillions = (num) => {
    if (!num || isNaN(num)) return '0.00M';
    const millions = num / 1000000;
    return millions.toFixed(2) + 'M';
  };

  // Calculate LTM Revenue (Last Twelve Months)
  const avgStreamsPerTrack = totalStreams / 10;
  const avgStreamsPerTrackM = avgStreamsPerTrack / 1000000;
  
  // Revenue calculation: Spotify pays ~$0.003-$0.005 per stream
  const revenuePerStream = 0.004;
  const ltmRevenue = totalStreams * revenuePerStream;
  const ltmRevenueM = ltmRevenue / 1000000;

  // Professional Valuation Ranges
  const conservativeValuation = ltmRevenue * 6;
  const marketValuation = ltmRevenue * 8;
  const premiumValuation = ltmRevenue * 10;

  // Estimated main valuation (using market standard + popularity factor)
  const popularityMultiplier = 1 + (popularity / 100) * 0.3;
  const estimatedValuation = marketValuation * popularityMultiplier;

  // Advance Potential Calculations
  const recordingAdvance = ltmRevenue * 0.15;
  const tourSupport = ltmRevenue * 0.09;
  const marketingBudget = ltmRevenue * 0.06;
  const totalAdvancePackage = recordingAdvance + tourSupport + marketingBudget;

  // Growth-Adjusted Valuation
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/valuation')}
            className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700 dark:border-slate-600 text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
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
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/40 dark:from-slate-900/90 dark:to-purple-950/40 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
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
                  <div className="w-full h-full rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center">
                    <Music size={48} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg">
                <Music size={20} />
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <Music size={20} className="text-emerald-400" />
                <h1 className="text-3xl sm:text-4xl font-bold">{artistData.name}</h1>
              </div>
              <p className="text-slate-300 dark:text-slate-400 text-sm mb-4">
                Spotify Financial & Market Valuation
              </p>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {/* Estimated Valuation */}
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-4 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <DollarSign size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Estimated Valuation</p>
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
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Music size={20} className="text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Engaged Fanbase</p>
                      <h3 className="text-xl font-bold">{formatToMillions(followers)}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Followers</p>
                    </div>
                  </div>
                </div>

                {/* Top 10 Streams */}
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Music size={20} className="text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Top 10 Total Streams</p>
                      <h3 className="text-xl font-bold">{formatToBillions(totalStreams)}</h3>
                      <p className="text-xs text-emerald-400">
                        {hasRealData ? 'Real data' : 'Estimated'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Popularity Index */}
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <TrendingUp size={20} className="text-orange-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Popularity Index</p>
                      <h3 className="text-xl font-bold">{popularity}/100</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">vs Industry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stream Valuation Input */}
        <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Music size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stream Valuation Input</h2>
              {hasRealData && (
                <p className="text-sm text-emerald-400">✓ Using real data from {artistData.platform}</p>
              )}
            </div>
          </div>

          <p className="text-slate-300 dark:text-slate-400 text-sm mb-4">
            {hasRealData 
              ? `Real total streams from ${artistData.platform} for the artist's top ${artistData.topTracks?.length || 10} tracks. Edit to refine the valuation.`
              : "Estimated total streams for the artist's top 10 tracks. Edit to use real data."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-2">
                Top 10 Total Streams
              </label>
              <input
                type="text"
                value={formatNumber(parseFloat(streamInput.replace(/,/g, '')))}
                onChange={(e) => setStreamInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 bg-slate-900/50 dark:bg-slate-950/50 border border-slate-600 dark:border-slate-700 rounded-lg text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="7,000,000,000"
              />
            </div>
            <Button
              icon={Save}
              onClick={handleRecalculate}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 whitespace-nowrap"
            >
              Save & Recalculate
            </Button>
          </div>
        </Card>

        {/* Per-Track Revenue Calculation */}
        <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calculator size={24} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold">Per-Track Last Twelve Month Revenue Calculation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">Total Streams (Top 10)</p>
              <p className="text-3xl font-bold text-white">{formatToBillions(totalStreams)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">Avg Streams per Track</p>
              <p className="text-3xl font-bold text-white">{formatToMillions(avgStreamsPerTrack)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">Top Tracks</p>
              <p className="text-3xl font-bold text-emerald-400">10</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
            <p className="text-sm text-emerald-400 mb-2 font-semibold">Total LTM Revenue (Top 10)</p>
            <p className="text-5xl font-bold text-emerald-400">${formatToMillions(ltmRevenue)}</p>
          </div>
        </Card>

        {/* Professional Valuation Ranges */}
        <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Professional Valuation Ranges</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conservative */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Conservative (6x Revenue)</h3>
              <p className="text-4xl font-bold text-blue-400 mb-2">
                ${formatToMillions(conservativeValuation)}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Traditional industry standard</p>
            </div>

            {/* Market Standard */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-500/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Market Standard (8x Revenue)</h3>
              <p className="text-4xl font-bold text-emerald-400 mb-2">
                ${formatToMillions(marketValuation)}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Current market average</p>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium (10x Revenue)</h3>
              <p className="text-4xl font-bold text-purple-400 mb-2">
                ${formatToMillions(premiumValuation)}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">High-growth potential artists</p>
            </div>
          </div>
        </Card>

        {/* Advance Potential & Growth Adjusted */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advance Potential */}
          <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Music size={24} className="text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold">Advance Potential</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 dark:border-slate-600">
                <span className="text-slate-300 dark:text-slate-400">Recording Advance</span>
                <span className="text-xl font-bold text-yellow-400">
                  ${formatToMillions(recordingAdvance)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 dark:border-slate-600">
                <span className="text-slate-300 dark:text-slate-400">Tour Support</span>
                <span className="text-xl font-bold text-yellow-400">
                  ${formatToMillions(tourSupport)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 dark:border-slate-600">
                <span className="text-slate-300 dark:text-slate-400">Marketing Budget</span>
                <span className="text-xl font-bold text-yellow-400">
                  ${formatToMillions(marketingBudget)}
                </span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-yellow-400">Total Package</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    ${formatToMillions(totalAdvancePackage)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Growth-Adjusted Valuation */}
          <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-slate-700/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">Growth-Adjusted Valuation</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 dark:border-slate-600">
                <span className="text-slate-300 dark:text-slate-400">Base 8x Valuation</span>
                <span className="text-xl font-bold">
                  ${formatToMillions(marketValuation)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 dark:border-slate-600">
                <span className="text-slate-300 dark:text-slate-400">CACC Growth (+{(caccGrowth * 100).toFixed(0)}%)</span>
                <span className="text-xl font-bold text-emerald-400">
                  +${formatToMillions(growthAdjustedValue - marketValuation)}
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-400">Adjusted Valuation</span>
                  <span className="text-2xl font-bold text-emerald-400">
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
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 dark:from-emerald-600 dark:to-blue-600 dark:hover:from-emerald-700 dark:hover:to-blue-700 text-white shadow-lg shadow-emerald-500/30 px-8"
          >
            Save Valuation Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistValuationDetail;