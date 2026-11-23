import React, { useState } from 'react';
import { Sparkles, DollarSign, Users, Calendar, ShoppingBag, ArrowRight, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react';
import { generateBudgetPlan, generateFamilyPlan } from '../services/api';

export default function AiBudgetPlanner({ onAddMultipleToCart, onAddToCart }) {
  const [activeSubTab, setActiveSubTab] = useState('budget'); // 'budget' | 'family'
  
  // Budget Planner State
  const [budget, setBudget] = useState(1500);
  const [familySize, setFamilySize] = useState('Family of 4');
  const [diet, setDiet] = useState('Vegetarian');
  const [period, setPeriod] = useState('Weekly');
  const [loading, setLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  // Family Blueprint State
  const [famLoading, setFamLoading] = useState(false);
  const [familyPlanResult, setFamilyPlanResult] = useState(null);

  const handleGenerateBudgetPlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setAddedAllSuccess(false);

    try {
      const res = await generateBudgetPlan({
        budget: Number(budget),
        familySize,
        diet,
        period
      });
      setBudgetPlan(res.data);
    } catch (err) {
      setErrorMsg('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFamilyBlueprint = async () => {
    setFamLoading(true);
    try {
      const res = await generateFamilyPlan({
        familySize,
        period,
        diet
      });
      setFamilyPlanResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFamLoading(false);
    }
  };

  const handleAddAllItems = () => {
    if (!budgetPlan || !budgetPlan.items) return;
    const itemsToAdd = budgetPlan.items
      .filter(item => item.productId)
      .map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        unit: item.unit || '1 unit',
        quantity: item.quantity || 1
      }));

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      setAddedAllSuccess(true);
      setTimeout(() => setAddedAllSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini-Powered Grocery Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            AI Smart Grocery & Budget Planner
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 leading-relaxed">
            Never overspend on groceries again. Tell Gemini your exact budget and family size, and our AI will build a perfectly balanced, wholesome basket from live store inventory with 1-click cart addition.
          </p>

          {/* Sub tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveSubTab('budget')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'budget'
                  ? 'bg-white text-emerald-800 shadow-md'
                  : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-900/80'
              }`}
            >
              💰 Budget-Based Grocery Builder
            </button>
            <button
              onClick={() => {
                setActiveSubTab('family');
                if (!familyPlanResult) handleGenerateFamilyBlueprint();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'family'
                  ? 'bg-white text-emerald-800 shadow-md'
                  : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-900/80'
              }`}
            >
              👨‍👩‍👧‍👦 Family Blueprint & Schedules
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: Budget-Based Planner */}
      {activeSubTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-5">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <span>Set Your Preferences</span>
            </h3>

            <form onSubmit={handleGenerateBudgetPlan} className="space-y-4">
              
              {/* Budget Input & Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Grocery Budget (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="200"
                    max="20000"
                    step="50"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-base focus:outline-emerald-600"
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[500, 1000, 1500, 2500, 4000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setBudget(val)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        Number(budget) === val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Size */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Household / Family Size
                </label>
                <select
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 focus:outline-emerald-600"
                >
                  <option value="1 Person (Bachelor/Student)">1 Person (Bachelor / Solo)</option>
                  <option value="2 Adults (Couple)">2 Adults (Couple)</option>
                  <option value="Family of 4 (2 Adults + 2 Kids)">Family of 4 (2 Adults + 2 Kids)</option>
                  <option value="Large Family (5+ Members)">Large Family (5+ Members)</option>
                </select>
              </div>

              {/* Dietary preference */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Diet Preference
                  </label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="High Protein">High Protein</option>
                    <option value="All-inclusive">All-inclusive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="Weekly">Weekly (7 Days)</option>
                    <option value="Monthly">Monthly (30 Days)</option>
                    <option value="Quick 3 Days">Quick 3 Days</option>
                  </select>
                </div>
              </div>

              {/* Generate CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini is Optimizing Basket...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Grocery Basket</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base">Gemini AI is crafting your smart grocery plan</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Balancing daily nutritional staples, whole wheat grains, lentils, and farm fresh vegetables within ₹{budget}...
                </p>
              </div>
            ) : budgetPlan ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{budgetPlan.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{budgetPlan.explanation}</p>
                  </div>
                  <div className="text-right bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Estimated Total</span>
                    <p className="text-2xl font-black text-emerald-700">₹{budgetPlan.totalEstimatedCost}</p>
                    <span className="text-[10px] text-emerald-800">
                      Remaining: ₹{budgetPlan.budgetRemaining} of ₹{budget}
                    </span>
                  </div>
                </div>

                {/* Savings Tip */}
                {budgetPlan.savingsTip && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">AI Money Saver: </strong>
                      <span>{budgetPlan.savingsTip}</span>
                    </div>
                  </div>
                )}

                {/* Generated Items Table / List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Grocery Items ({budgetPlan.items?.length || 0})
                  </h4>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                    {budgetPlan.items?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{item.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-slate-900 text-sm">₹{item.lineTotal || item.price}</span>
                          <p className="text-[10px] text-slate-400">{item.unit || `${item.quantity} qty`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {addedAllSuccess ? (
                    <div className="w-full py-3 bg-emerald-100 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>All {budgetPlan.items?.length} items added to your SmartBasket!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddAllItems}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add All AI-Recommended Items to Cart (₹{budgetPlan.totalEstimatedCost})</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-emerald-500 mb-2 opacity-50" />
                <h4 className="font-bold text-slate-700 text-sm">No grocery plan generated yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Adjust your budget on the left and click "Generate AI Grocery Basket" to view recommendations.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Subtab 2: Family Size Blueprint */}
      {activeSubTab === 'family' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Family Size Blueprint: {familySize} ({period})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated consumption quotas for whole grains, pulses, dairy, and farm greens.
              </p>
            </div>
            <button
              onClick={handleGenerateFamilyBlueprint}
              disabled={famLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${famLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate Blueprint</span>
            </button>
          </div>

          {famLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
              <span>Gemini is calculating portion sizes and schedules...</span>
            </div>
          ) : familyPlanResult ? (
            <div className="space-y-6">
              {familyPlanResult.weeklyRoutineTip && (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
                  <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Logistics & Preservation Tip: </strong>
                    <span>{familyPlanResult.weeklyRoutineTip}</span>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                {familyPlanResult.categories?.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {cat.items?.length} items
                      </span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      {cat.items?.map((item, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.quantity}</p>
                          </div>
                          {item.price && (
                            <span className="font-bold text-emerald-700">₹{item.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}
