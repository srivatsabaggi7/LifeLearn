import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ShoppingBag, X, ArrowRight, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface GroceryItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isRecipeItem: boolean;
  isOnSale?: boolean;
  salePrice?: number;
}

interface Recipe {
  id: number;
  name: string;
  budget: number;
  requiredItems: number[];
}

// Game data
const recipes: Recipe[] = [
  {
    id: 1,
    name: "Spaghetti Dinner",
    budget: 20,
    requiredItems: [1, 3, 5, 7, 9]
  },
  {
    id: 2,
    name: "Breakfast Feast",
    budget: 15,
    requiredItems: [2, 4, 6, 8]
  },
  {
    id: 3,
    name: "Healthy Lunch",
    budget: 25,
    requiredItems: [10, 11, 12, 13, 14]
  }
];

const groceryItems: GroceryItem[] = [
  { id: 1, name: "Pasta", price: 2.99, image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg", category: "Grains", isRecipeItem: true },
  { id: 2, name: "Eggs", price: 3.49, image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg", category: "Dairy", isRecipeItem: true },
  { id: 3, name: "Tomato Sauce", price: 1.99, image: "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg", category: "Canned Goods", isRecipeItem: true, isOnSale: true, salePrice: 1.49 },
  { id: 4, name: "Milk", price: 2.99, image: "https://images.pexels.com/photos/2148215/pexels-photo-2148215.jpeg", category: "Dairy", isRecipeItem: true },
  { id: 5, name: "Ground Beef", price: 5.99, image: "https://images.pexels.com/photos/618775/pexels-photo-618775.jpeg", category: "Meat", isRecipeItem: true },
  { id: 6, name: "Bacon", price: 4.99, image: "https://images.pexels.com/photos/929137/pexels-photo-929137.jpeg", category: "Meat", isRecipeItem: true, isOnSale: true, salePrice: 3.99 },
  { id: 7, name: "Parmesan Cheese", price: 3.99, image: "https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg", category: "Dairy", isRecipeItem: true },
  { id: 8, name: "Bread", price: 2.49, image: "https://images.pexels.com/photos/1756061/pexels-photo-1756061.jpeg", category: "Bakery", isRecipeItem: true },
  { id: 9, name: "Garlic", price: 0.99, image: "https://images.pexels.com/photos/172951/pexels-photo-172951.jpeg", category: "Produce", isRecipeItem: true },
  { id: 10, name: "Lettuce", price: 1.99, image: "https://images.pexels.com/photos/2894206/pexels-photo-2894206.jpeg", category: "Produce", isRecipeItem: true },
  { id: 11, name: "Chicken Breast", price: 6.99, image: "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg", category: "Meat", isRecipeItem: true },
  { id: 12, name: "Quinoa", price: 4.99, image: "https://images.pexels.com/photos/8469364/pexels-photo-8469364.jpeg", category: "Grains", isRecipeItem: true },
  { id: 13, name: "Avocado", price: 1.99, image: "https://images.pexels.com/photos/2228553/pexels-photo-2228553.jpeg", category: "Produce", isRecipeItem: true },
  { id: 14, name: "Olive Oil", price: 5.99, image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg", category: "Condiments", isRecipeItem: true },
  { id: 15, name: "Chips", price: 3.49, image: "https://images.pexels.com/photos/568805/pexels-photo-568805.jpeg", category: "Snacks", isRecipeItem: false, isOnSale: true, salePrice: 2.49 },
  { id: 16, name: "Soda", price: 1.99, image: "https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg", category: "Beverages", isRecipeItem: false },
  { id: 17, name: "Cookies", price: 2.99, image: "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg", category: "Snacks", isRecipeItem: false, isOnSale: true, salePrice: 1.99 },
  { id: 18, name: "Ice Cream", price: 4.49, image: "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg", category: "Frozen", isRecipeItem: false },
];

// Group items by category
const categories = Array.from(new Set(groceryItems.map(item => item.category)));

export default function BudgetGamePlay() {
  const router = useRouter();
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [basket, setBasket] = useState<GroceryItem[]>([]);
  const [gameStage, setGameStage] = useState<'shopping' | 'checkout' | 'results'>('shopping');
  const [totalSpent, setTotalSpent] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  useEffect(() => {
    // Randomly select a recipe when the component mounts
    const randomIndex = Math.floor(Math.random() * recipes.length);
    setCurrentRecipe(recipes[randomIndex]);
  }, []);

  useEffect(() => {
    // Update total spent whenever the basket changes
    const total = basket.reduce((sum, item) => {
      return sum + (item.isOnSale ? (item.salePrice || item.price) : item.price);
    }, 0);
    setTotalSpent(total);
  }, [basket]);

  const handleAddToBasket = (item: GroceryItem) => {
    if (!basket.some(basketItem => basketItem.id === item.id)) {
      setBasket([...basket, item]);
    }
  };

  const handleRemoveFromBasket = (itemId: number) => {
    setBasket(basket.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    setGameStage('checkout');
  };

  const handleCompleteCheckout = () => {
    setGameStage('results');
  };

  const calculateScore = () => {
    if (!currentRecipe) return 0;
    
    // Start with 100 points
    let score = 100;
    
    // Check if all required items are in the basket
    const requiredItemsInBasket = currentRecipe.requiredItems.filter(
      itemId => basket.some(item => item.id === itemId)
    );
    
    // Deduct 10 points for each missing required item
    score -= (currentRecipe.requiredItems.length - requiredItemsInBasket.length) * 10;
    
    // Deduct 5 points for each unnecessary item
    const unnecessaryItems = basket.filter(
      item => !currentRecipe.requiredItems.includes(item.id)
    );
    score -= unnecessaryItems.length * 5;
    
    // Deduct 1 point for each dollar over budget (if over budget)
    if (totalSpent > currentRecipe.budget) {
      score -= Math.floor(totalSpent - currentRecipe.budget);
    }
    
    return Math.max(0, score); // Score can't be negative
  };

  const saveGameResults = async () => {
    try {
      const score = calculateScore();
      const gameResult = {
        recipe: currentRecipe?.name,
        score,
        totalSpent,
        budget: currentRecipe?.budget,
        date: new Date().toISOString(),
      };
      
      // Get existing scores
      const scoresString = await AsyncStorage.getItem('budgetGameScores');
      const scores = scoresString ? JSON.parse(scoresString) : [];
      
      // Add new score
      scores.push(gameResult);
      
      // Save updated scores
      await AsyncStorage.setItem('budgetGameScores', JSON.stringify(scores));
      
      // Update streak
      const currentDateStr = new Date().toDateString();
      const lastPlayedDateStr = await AsyncStorage.getItem('lastPlayedDate');
      
      if (lastPlayedDateStr !== currentDateStr) {
        await AsyncStorage.setItem('lastPlayedDate', currentDateStr);
        
        const streakStr = await AsyncStorage.getItem('streak') || '0';
        const streak = parseInt(streakStr, 10);
        await AsyncStorage.setItem('streak', (streak + 1).toString());
      }
      
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  };

  const renderShoppingStage = () => (
    <>
      <View style={styles.recipeInfoContainer}>
        <View style={styles.recipeCard}>
          <Text style={styles.recipeTitle}>{currentRecipe?.name}</Text>
          <Text style={styles.recipeBudget}>Budget: ${currentRecipe?.budget.toFixed(2)}</Text>
          <Text style={styles.recipeInstructions}>
            Buy all the ingredients you need while staying within your budget.
          </Text>
        </View>
        
        <View style={styles.basketSummary}>
          <View style={styles.basketIconContainer}>
            <ShoppingBag size={20} color="#FFF" />
            <Text style={styles.basketCount}>{basket.length}</Text>
          </View>
          <Text style={styles.basketTotal}>Total: ${totalSpent.toFixed(2)}</Text>
          <TouchableOpacity 
            style={[
              styles.checkoutButton,
              totalSpent > 0 ? {} : styles.checkoutButtonDisabled
            ]}
            onPress={handleCheckout}
            disabled={totalSpent === 0}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextSelected
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.productsContainer}>
        <FlatList
          data={groceryItems.filter(item => item.category === selectedCategory)}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              
              {item.isOnSale && (
                <View style={styles.saleTag}>
                  <Text style={styles.saleTagText}>SALE</Text>
                </View>
              )}
              
              <Text style={styles.productName}>{item.name}</Text>
              
              <View style={styles.productPriceRow}>
                {item.isOnSale ? (
                  <>
                    <Text style={styles.productOldPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.productPrice}>${item.salePrice?.toFixed(2)}</Text>
                  </>
                ) : (
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                )}
              </View>
              
              {basket.some(basketItem => basketItem.id === item.id) ? (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromBasket(item.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToBasket(item)}
                >
                  <Text style={styles.addButtonText}>Add to Basket</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    </>
  );

  const renderCheckoutStage = () => (
    <View style={styles.checkoutContainer}>
      <Text style={styles.checkoutTitle}>Checkout</Text>
      
      <View style={styles.receiptCard}>
        <Text style={styles.receiptHeader}>Your Shopping Receipt</Text>
        
        <View style={styles.receiptItems}>
          {basket.map(item => (
            <View key={item.id} style={styles.receiptItem}>
              <Text style={styles.receiptItemName}>{item.name}</Text>
              <Text style={styles.receiptItemPrice}>
                ${(item.isOnSale ? (item.salePrice || item.price) : item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.receiptDivider} />
        
        <View style={styles.receiptTotal}>
          <Text style={styles.receiptTotalLabel}>Total:</Text>
          <Text style={styles.receiptTotalAmount}>${totalSpent.toFixed(2)}</Text>
        </View>
        
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetLabel}>Your Budget:</Text>
          <Text style={styles.budgetAmount}>${currentRecipe?.budget.toFixed(2)}</Text>
        </View>
        
        <View style={styles.budgetStatusContainer}>
          {totalSpent <= (currentRecipe?.budget || 0) ? (
            <>
              <View style={styles.budgetStatusIconSuccess}>
                <Check size={20} color="#FFF" />
              </View>
              <Text style={styles.budgetStatusTextSuccess}>
                You stayed within budget!
              </Text>
            </>
          ) : (
            <>
              <View style={styles.budgetStatusIconFailure}>
                <AlertCircle size={20} color="#FFF" />
              </View>
              <Text style={styles.budgetStatusTextFailure}>
                You went over budget by ${(totalSpent - (currentRecipe?.budget || 0)).toFixed(2)}
              </Text>
            </>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={handleCompleteCheckout}
      >
        <Text style={styles.completeButtonText}>Complete Checkout</Text>
        <ArrowRight size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderResultsStage = () => {
    const score = calculateScore();
    
    // Save results when showing the results screen
    useEffect(() => {
      saveGameResults();
    }, []);
    
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
        
        <Text style={styles.resultsFeedback}>
          {score >= 80 ? 'Great job!' : score >= 60 ? 'Good effort!' : 'Keep practicing!'}
        </Text>
        
        <View style={styles.resultsCard}>
          <Text style={styles.resultsCardTitle}>Shopping Summary</Text>
          
          <View style={styles.resultsStat}>
            <Text style={styles.resultsStatLabel}>Required Items:</Text>
            <Text style={styles.resultsStatValue}>
              {currentRecipe?.requiredItems.filter(
                itemId => basket.some(item => item.id === itemId)
              ).length || 0} / {currentRecipe?.requiredItems.length || 0}
            </Text>
          </View>
          
          <View style={styles.resultsStat}>
            <Text style={styles.resultsStatLabel}>Unnecessary Items:</Text>
            <Text style={styles.resultsStatValue}>
              {basket.filter(
                item => !currentRecipe?.requiredItems.includes(item.id)
              ).length || 0}
            </Text>
          </View>
          
          <View style={styles.resultsStat}>
            <Text style={styles.resultsStatLabel}>Budget Status:</Text>
            <Text 
              style={[
                styles.resultsStatValue,
                totalSpent <= (currentRecipe?.budget || 0) 
                  ? styles.resultsStatValueSuccess 
                  : styles.resultsStatValueFailure
              ]}
            >
              {totalSpent <= (currentRecipe?.budget || 0) 
                ? 'Within Budget' 
                : `Over by $${(totalSpent - (currentRecipe?.budget || 0)).toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.resultsStat}>
            <Text style={styles.resultsStatLabel}>Total Spent:</Text>
            <Text style={styles.resultsStatValue}>${totalSpent.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.resultsButtonsContainer}>
          <TouchableOpacity 
            style={styles.playAgainButton}
            onPress={() => router.replace('/(tabs)/budget-game/play')}
          >
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)/budget-game')}
          >
            <Text style={styles.homeButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#64748B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Budget Game</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {gameStage === 'shopping' && renderShoppingStage()}
        {gameStage === 'checkout' && renderCheckoutStage()}
        {gameStage === 'results' && renderResultsStage()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginLeft: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  recipeInfoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recipeCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recipeTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  recipeBudget: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4A7BF7',
    marginBottom: 8,
  },
  recipeInstructions: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  basketSummary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  basketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7BF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  basketCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  basketTotal: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#4A7BF7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  checkoutButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScrollContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonSelected: {
    backgroundColor: '#4A7BF7',
  },
  categoryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flex: 1,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  saleTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleTagText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  productName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#1E293B',
  },
  productOldPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  addButton: {
    backgroundColor: '#4A7BF7',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FF6B6B',
  },
  checkoutContainer: {
    padding: 16,
  },
  checkoutTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  receiptHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptItems: {
    marginBottom: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptItemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1E293B',
  },
  receiptItemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptTotalLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  receiptTotalAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  budgetLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  budgetAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#4A7BF7',
  },
  budgetStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  budgetStatusIconSuccess: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ED573',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  budgetStatusIconFailure: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  budgetStatusTextSuccess: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#2ED573',
  },
  budgetStatusTextFailure: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FF6B6B',
  },
  completeButton: {
    backgroundColor: '#4A7BF7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4A7BF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4A7BF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultsFeedback: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resultsCardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsStatLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  resultsStatValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#1E293B',
  },
  resultsStatValueSuccess: {
    color: '#2ED573',
  },
  resultsStatValueFailure: {
    color: '#FF6B6B',
  },
  resultsButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#4A7BF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  playAgainButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  homeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#64748B',
  },
});