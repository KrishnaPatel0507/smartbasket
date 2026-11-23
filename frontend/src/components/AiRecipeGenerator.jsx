import React, { useState } from 'react';
import { ChefHat, Sparkles, Clock, Users, Flame, Plus, CheckCircle2, ShoppingBag, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { generateRecipe } from '../services/api';

export default function AiRecipeGenerator({ onAddMultipleToCart, onAddToCart }) {
  const [ingredientsInput, setIngredientsInput] = useState('Potatoes, Onions, Tomatoes');
  const [mealType, setMealType] = useState('Dinner');
  const [dietary, setDietary] = useState('Vegetarian');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedMissingSuccess, setAddedMissingSuccess] = useState(false);

  const quickPantryTags = [
    'Potatoes', 'Onions', 'Tomatoes', 'Paneer', 'Green Peas',
    'Whole Wheat Bread', 'Toor Dal', 'Basmati Rice', 'Green Capsicum', 'Spinach', 'Pure Cow Ghee'
  ];

  const handleToggleTag = (tag) => {
    const current = ingredientsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(tag)) {
      setIngredientsInput(current.filter(t => t !== tag).join(', '));
    } else {
      setIngredientsInput([...current, tag].join(', '));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!ingredientsInput.trim()) {
      setErrorMsg('Please enter or select at least one ingredient.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setAddedMissingSuccess(false);

    try {
      const res = await generateRecipe({
        ingredients: ingredientsInput,
        mealType,
        dietary
      });
      setRecipe(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate recipe with Gemini. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMissingToCart = () => {
    if (!recipe || !recipe.missingIngredients) return;

    const itemsToAdd = recipe.missingIngredients
      .filter(m => m.matchedProductId)
      .map(m => ({
        id: m.matchedProductId,
        name: m.matchedProductName || m.name,
        price: m.matchedProductPrice || 45,
        unit: m.matchedProductUnit || '1 unit',
        quantity: 1
      }));

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      setAddedMissingSuccess(true);
      setTimeout(() => setAddedMissingSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-200 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <ChefHat className="w-4 h-4" />
            <span>AI Smart Kitchen & Recipe Automator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            AI Recipe Generator & Pantry Matcher
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100 leading-relaxed">
            Enter the ingredients you currently have at home. Google Gemini will design an authentic, delicious recipe, detect exactly what ingredients are missing, and let you add them to your cart in one tap!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ingredients Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-5">
          <h3 className="font-extrabold text-slate-900 text-lg">
            What's in Your Kitchen?
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Textarea for ingredients */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Available Ingredients
              </label>
              <textarea
                rows={3}
                required
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                placeholder="e.g. Potatoes, Tomatoes, Onions, Paneer, Rice..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-emerald-600 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Separate ingredients with commas or tap the quick tags below.
              </p>
            </div>

            {/* Quick ingredient tags */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Add Pantry Items
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPantryTags.map((tag) => {
                  const isSelected = ingredientsInput.toLowerCase().includes(tag.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Type & Dietary selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="Quick 15-Min">Quick 15-Min Snack</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Sweet / Dessert</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Dietary
                </label>
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="Vegetarian">100% Vegetarian</option>
                  <option value="Vegan">Vegan (Plant-Based)</option>
                  <option value="High Protein">High Protein Veg</option>
                  <option value="Jain (Satvik)">Jain (No Onion/Garlic)</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini is Crafting Recipe...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>Generate Recipe & Identify Missing Items</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Recipe & Missing Ingredients Output */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <ChefHat className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Gemini Master Chef at Work</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Evaluating flavor profiles, cross-referencing SmartBasket catalog for missing spices, and generating step-by-step instructions...
              </p>
            </div>
          ) : recipe ? (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              {/* Recipe Title & Meta */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {recipe.difficulty || 'Easy'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">{mealType}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{recipe.recipeTitle}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{recipe.description}</p>
                
                {/* Meta pills */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Prep: {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Cook: {recipe.cookTime}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Servings: {recipe.servings}
                  </span>
                </div>
              </div>

              {/* Chef Tip */}
              {recipe.chefTip && (
                <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Chef's Secret Tip: </strong>
                    <span>{recipe.chefTip}</span>
                  </div>
                </div>
              )}

              {/* Missing Ingredients Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-extrabold text-emerald-950 text-sm">
                      Missing Ingredients Identified by AI ({recipe.missingIngredients?.length || 0})
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                    Direct Store Match
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {recipe.missingIngredients?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({item.requiredQuantity})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{item.reason}</p>
                      </div>

                      {item.matchedProductId && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-emerald-700 text-sm">
                            ₹{item.matchedProductPrice}
                          </span>
                          <button
                            onClick={() => onAddToCart({
                              id: item.matchedProductId,
                              name: item.matchedProductName || item.name,
                              price: item.matchedProductPrice,
                              unit: item.matchedProductUnit || '1 unit'
                            })}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Add item to cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add All Missing Items CTA */}
                {addedMissingSuccess ? (
                  <div className="w-full py-2.5 bg-emerald-200 text-emerald-900 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Missing ingredients added to your shopping cart!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddMissingToCart}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add All Missing Ingredients to Cart</span>
                  </button>
                )}
              </div>

              {/* Cooking Instructions */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Step-by-Step Cooking Instructions
                </h4>
                <div className="space-y-3">
                  {recipe.instructions?.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <ChefHat className="w-10 h-10 text-teal-500 mb-2 opacity-50" />
              <h4 className="font-bold text-slate-700 text-sm">Ready to cook something delicious?</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter ingredients on the left and let Gemini create your customized recipe and identify missing items.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
