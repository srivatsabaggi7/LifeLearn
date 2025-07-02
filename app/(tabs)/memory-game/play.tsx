import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { X, Clock, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

// Card images
const cardImages = [
  'https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/207529/pexels-photo-207529.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5157275/pexels-photo-5157275.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/851552/pexels-photo-851552.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400',
];

interface Card {
  id: number;
  imageUrl: string;
  flipped: boolean;
  matched: boolean;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 5;
const GRID_SIZE = 4; // 4x4 grid
const CARD_SIZE = (width - 40 - (CARD_MARGIN * 2 * GRID_SIZE)) / GRID_SIZE;

export default function MemoryGamePlay() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [firstCard, setFirstCard] = useState<number | null>(null);
  const [secondCard, setSecondCard] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const cardFlips = useRef<{[key: number]: Animated.SharedValue<number>}>({});

  useEffect(() => {
    // Initialize the game with shuffled cards
    initGame();
    
    // Clean up timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Check if game is completed (all cards matched)
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setGameCompleted(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Calculate score based on moves and time
      const timeScore = Math.max(0, 100 - Math.floor(timer / 3));
      const moveScore = Math.max(0, 100 - (moves * 2));
      const finalScore = Math.floor((timeScore + moveScore) / 2);
      
      setScore(finalScore);
      saveGameResults(finalScore);
    }
  }, [cards]);

  useEffect(() => {
    // Check for match when two cards are selected
    if (firstCard !== null && secondCard !== null) {
      // Increment moves
      setMoves(moves => moves + 1);
      
      // Check if the two flipped cards match
      if (cards[firstCard].imageUrl === cards[secondCard].imageUrl) {
        // Cards match
        setCards(prevCards => 
          prevCards.map((card, index) => 
            index === firstCard || index === secondCard 
              ? { ...card, matched: true } 
              : card
          )
        );
        
        // Reset selected cards
        setFirstCard(null);
        setSecondCard(null);
      } else {
        // Cards don't match, flip them back after a delay
        setTimeout(() => {
          // Animate flipping back
          cardFlips.current[firstCard].value = withSequence(
            withTiming(0, { duration: 200, easing: Easing.ease }),
            withTiming(1, { duration: 200, easing: Easing.ease })
          );
          
          cardFlips.current[secondCard].value = withSequence(
            withTiming(0, { duration: 200, easing: Easing.ease }),
            withTiming(1, { duration: 200, easing: Easing.ease })
          );
          
          // Update state
          setCards(prevCards => 
            prevCards.map((card, index) => 
              index === firstCard || index === secondCard 
                ? { ...card, flipped: false } 
                : card
            )
          );
          
          // Reset selected cards
          setFirstCard(null);
          setSecondCard(null);
        }, 1000);
      }
    }
  }, [firstCard, secondCard]);

  const initGame = () => {
    // Create pairs of cards with the same image
    const cardPairs = [...cardImages, ...cardImages]
      .map((imageUrl, index) => ({
        id: index,
        imageUrl,
        flipped: false,
        matched: false
      }))
      .sort(() => Math.random() - 0.5); // Shuffle cards
    
    setCards(cardPairs);
    setMoves(0);
    setTimer(0);
    setGameCompleted(false);
    setFirstCard(null);
    setSecondCard(null);
    setGameStarted(false);
    
    // Initialize animation values for all cards
    cardPairs.forEach((card) => {
      if (!cardFlips.current[card.id]) {
        cardFlips.current[card.id] = useSharedValue(1);
      } else {
        cardFlips.current[card.id].value = 1;
      }
    });
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startTimer = () => {
    if (!gameStarted) {
      setGameStarted(true);
      
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
  };

  const handleCardPress = (index: number) => {
    // Start timer on first card flip
    if (!gameStarted) {
      startTimer();
    }
    
    // Ignore if card is already flipped or matched
    if (cards[index].flipped || cards[index].matched) {
      return;
    }
    
    // Ignore if two cards are already flipped and being checked
    if (firstCard !== null && secondCard !== null) {
      return;
    }
    
    // Flip the card with animation
    cardFlips.current[index].value = withSequence(
      withTiming(0, { duration: 200, easing: Easing.ease }),
      withTiming(1, { duration: 200, easing: Easing.ease })
    );
    
    // Update card state
    setCards(prevCards => 
      prevCards.map((card, i) => 
        i === index ? { ...card, flipped: true } : card
      )
    );
    
    // Set as first or second card
    if (firstCard === null) {
      setFirstCard(index);
    } else {
      setSecondCard(index);
    }
  };

  const saveGameResults = async (finalScore: number) => {
    try {
      const gameResult = {
        score: finalScore,
        moves,
        time: timer,
        date: new Date().toISOString(),
      };
      
      // Get existing scores
      const scoresString = await AsyncStorage.getItem('memoryGameScores');
      const scores = scoresString ? JSON.parse(scoresString) : [];
      
      // Add new score
      scores.push(gameResult);
      
      // Save updated scores
      await AsyncStorage.setItem('memoryGameScores', JSON.stringify(scores));
      
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderCard = (card: Card, index: number) => {
    // Create or retrieve animation value for this card
    if (!cardFlips.current[card.id]) {
      cardFlips.current[card.id] = useSharedValue(1);
    }
    
    const flipAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(
        cardFlips.current[card.id].value,
        [0, 0.5, 1],
        [0, 90, 180]
      );
      
      return {
        transform: [
          { perspective: 800 },
          { rotateY: `${rotateY}deg` },
          { scale: card.matched ? 0.95 : 1 }
        ],
        backgroundColor: card.matched ? '#E6F9F0' : '#FFFFFF',
        opacity: card.matched ? 0.8 : 1,
      };
    });
    
    const frontAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        cardFlips.current[card.id].value,
        [0, 0.5, 0.5, 1],
        [1, 0, 0, 0]
      );
      
      return {
        opacity,
        transform: [
          { rotateY: '180deg' }
        ],
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#FF9F43',
      };
    });
    
    const backAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        cardFlips.current[card.id].value,
        [0, 0.5, 0.5, 1],
        [0, 0, 1, 1]
      );
      
      return {
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
      };
    });
    
    return (
      <TouchableOpacity 
        key={index}
        style={styles.cardContainer}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.9}
        disabled={card.flipped || card.matched || gameCompleted}
      >
        <Animated.View style={[styles.card, flipAnimatedStyle]}>
          <Animated.View style={frontAnimatedStyle}>
            <Text style={styles.cardQuestionMark}>?</Text>
          </Animated.View>
          
          <Animated.View style={backAnimatedStyle}>
            <Animated.Image 
              source={{ uri: card.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderGameBoard = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameInfoBar}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Moves</Text>
          <Text style={styles.infoValue}>{moves}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Clock size={16} color="#FF9F43" style={styles.clockIcon} />
          <Text style={styles.infoValue}>{formatTime(timer)}</Text>
        </View>
      </View>
      
      <View style={styles.gridContainer}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>
    </View>
  );

  const renderGameCompleted = () => (
    <View style={styles.completedContainer}>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreLabel}>points</Text>
      </View>
      
      <Text style={styles.completedTitle}>Great Job!</Text>
      <Text style={styles.completedSubtitle}>You've completed the memory game</Text>
      
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(timer)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Cards</Text>
          <Text style={styles.statValue}>{cards.length}</Text>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.playAgainButton}
          onPress={initGame}
        >
          <Text style={styles.playAgainButtonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/memory-game')}
        >
          <Text style={styles.homeButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#64748B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Memory Game</Text>
      </View>

      {!gameCompleted ? renderGameBoard() : renderGameCompleted()}
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
  gameContainer: {
    padding: 20,
  },
  gameInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  infoValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  clockIcon: {
    marginRight: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: CARD_MARGIN,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardQuestionMark: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  completedContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF9F43',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF9F43',
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
  completedTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#64748B',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#FF9F43',
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