import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { X, ArrowRight, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

// Types
interface Option {
  id: number;
  text: string;
  consequence: string;
  score: number;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  image: string;
  options: Option[];
}

// Game data
const scenarios: Scenario[] = [
  {
    id: 1,
    title: "The Found Wallet",
    description: "You're walking in the park and find a wallet with $50 and ID cards. What do you do?",
    image: "https://images.pexels.com/photos/4709822/pexels-photo-4709822.jpeg",
    options: [
      {
        id: 1,
        text: "Keep the money and throw away the wallet",
        consequence: "The person who lost the wallet can't get their ID cards back, causing them a lot of trouble.",
        score: 0
      },
      {
        id: 2,
        text: "Take the wallet to the police station",
        consequence: "The owner is able to get their wallet back with everything intact. They're very grateful.",
        score: 100
      },
      {
        id: 3,
        text: "Take the money but mail the ID cards to the address",
        consequence: "The owner gets their ID cards back but loses their money, causing financial strain.",
        score: 30
      },
      {
        id: 4,
        text: "Leave the wallet where you found it",
        consequence: "Someone else might find the wallet and not return it, or it could get lost entirely.",
        score: 20
      }
    ]
  },
  {
    id: 2,
    title: "The Playground Dilemma",
    description: "You see a group of kids teasing another child at the playground. What do you do?",
    image: "https://images.pexels.com/photos/3041509/pexels-photo-3041509.jpeg",
    options: [
      {
        id: 1,
        text: "Join in with the teasing",
        consequence: "The child being teased feels even worse, and you contribute to their unhappiness.",
        score: 0
      },
      {
        id: 2,
        text: "Tell a teacher or adult about the situation",
        consequence: "An adult intervenes and addresses the bullying, helping all the children learn about kindness.",
        score: 90
      },
      {
        id: 3,
        text: "Directly tell the kids to stop teasing",
        consequence: "You stand up for what's right, but without adult help, the situation might continue later.",
        score: 80
      },
      {
        id: 4,
        text: "Walk away and ignore it",
        consequence: "The teasing continues, and the child being teased feels abandoned.",
        score: 10
      }
    ]
  },
  {
    id: 3,
    title: "The Test Answers",
    description: "Your friend offers to show you the answers to tomorrow's test. What do you do?",
    image: "https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg",
    options: [
      {
        id: 1,
        text: "Accept the answers and use them on the test",
        consequence: "You get a high score, but you haven't learned the material, and you've cheated.",
        score: 0
      },
      {
        id: 2,
        text: "Refuse the answers and study on your own",
        consequence: "You learn the material properly and feel proud of your honest achievement.",
        score: 100
      },
      {
        id: 3,
        text: "Tell the teacher that someone has the answers",
        consequence: "The test might be changed, ensuring fair results, but your friend might be upset with you.",
        score: 70
      },
      {
        id: 4,
        text: "Accept the answers but don't use them",
        consequence: "You avoid confrontation but still have to decide whether to cheat or not.",
        score: 40
      }
    ]
  },
  {
    id: 4,
    title: "The Broken Vase",
    description: "You accidentally break a vase at a friend's house. What do you do?",
    image: "https://images.pexels.com/photos/6532371/pexels-photo-6532371.jpeg",
    options: [
      {
        id: 1,
        text: "Pretend you don't know who broke it",
        consequence: "Your friend's family might blame someone else, and they won't trust you if they find out.",
        score: 0
      },
      {
        id: 2,
        text: "Tell your friend's parents and offer to replace it",
        consequence: "They appreciate your honesty and responsibility, strengthening trust.",
        score: 100
      },
      {
        id: 3,
        text: "Tell your friend but ask them not to tell their parents",
        consequence: "You're putting your friend in an awkward position and still not taking full responsibility.",
        score: 30
      },
      {
        id: 4,
        text: "Try to fix it yourself without telling anyone",
        consequence: "The vase might not be fixed properly, and people will wonder what happened.",
        score: 20
      }
    ]
  },
  {
    id: 5,
    title: "The Lunch Table",
    description: "You see a new student sitting alone at lunch. What do you do?",
    image: "https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg",
    options: [
      {
        id: 1,
        text: "Ignore them and sit with your friends",
        consequence: "The new student feels isolated and has a harder time making friends.",
        score: 10
      },
      {
        id: 2,
        text: "Invite them to sit with you and your friends",
        consequence: "The new student feels welcomed and begins to make connections at their new school.",
        score: 100
      },
      {
        id: 3,
        text: "Say hello but sit with your regular friends",
        consequence: "The new student feels acknowledged but still sits alone.",
        score: 40
      },
      {
        id: 4,
        text: "Tell other students they should invite the new kid over",
        consequence: "You're encouraging kindness but not taking direct action yourself.",
        score: 60
      }
    ]
  }
];

export default function SituationGamePlay() {
  const router = useRouter();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [gameStage, setGameStage] = useState<'scenario' | 'consequence' | 'results'>('scenario');
  const [totalScore, setTotalScore] = useState(0);
  const [showScenarios, setShowScenarios] = useState<Scenario[]>([]);
  
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const optionsOpacity = useSharedValue(0);
  const consequenceOpacity = useSharedValue(0);
  const scenarioSlideOut = useSharedValue(0);
  
  useEffect(() => {
    // Randomly select 3 scenarios when the component mounts
    const randomScenarios = [...scenarios].sort(() => 0.5 - Math.random()).slice(0, 3);
    setShowScenarios(randomScenarios);
    
    // Start animations
    cardOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    cardTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) });
    
    // Stagger the options animation
    setTimeout(() => {
      optionsOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 400);
  }, []);

  const handleSelectOption = (option: Option) => {
    setSelectedOption(option);
    
    // Animate the scenario sliding out
    scenarioSlideOut.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
      runOnJS(setGameStage)('consequence');
      runOnJS(animateConsequence)();
    });
  };

  const animateConsequence = () => {
    consequenceOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
  };

  const handleNextScenario = () => {
    if (selectedOption) {
      setTotalScore(totalScore + selectedOption.score);
    }
    
    // Reset animations
    scenarioSlideOut.value = 0;
    consequenceOpacity.value = 0;
    
    if (currentScenarioIndex < showScenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setSelectedOption(null);
      setGameStage('scenario');
      
      // Animate new scenario in
      cardOpacity.value = 0;
      cardTranslateY.value = 50;
      optionsOpacity.value = 0;
      
      setTimeout(() => {
        cardOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
        cardTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) });
        
        setTimeout(() => {
          optionsOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
        }, 400);
      }, 100);
    } else {
      setGameStage('results');
      saveGameResults();
    }
  };

  const saveGameResults = async () => {
    try {
      // Calculate final score (average of all scenario scores)
      const finalScore = Math.round((totalScore + (selectedOption?.score || 0)) / showScenarios.length);
      
      const gameResult = {
        score: finalScore,
        date: new Date().toISOString(),
        scenariosPlayed: showScenarios.length,
      };
      
      // Get existing scores
      const scoresString = await AsyncStorage.getItem('situationGameScores');
      const scores = scoresString ? JSON.parse(scoresString) : [];
      
      // Add new score
      scores.push(gameResult);
      
      // Save updated scores
      await AsyncStorage.setItem('situationGameScores', JSON.stringify(scores));
      
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

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });

  const optionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: optionsOpacity.value,
    };
  });

  const scenarioAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateX: interpolate(
            scenarioSlideOut.value,
            [0, 1],
            [0, -400]
          ) 
        }
      ],
      opacity: interpolate(
        scenarioSlideOut.value,
        [0, 0.7],
        [1, 0]
      ),
    };
  });

  const consequenceAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: consequenceOpacity.value,
    };
  });

  const getCurrentScenario = () => {
    if (showScenarios.length === 0) return null;
    return showScenarios[currentScenarioIndex];
  };

  const renderScenarioStage = () => {
    const currentScenario = getCurrentScenario();
    if (!currentScenario) return null;

    return (
      <View style={styles.sceneContainer}>
        <Animated.View style={[styles.scenarioContainer, scenarioAnimatedStyle]}>
          <Animated.View style={[styles.scenarioCard, cardAnimatedStyle]}>
            <Image source={{ uri: currentScenario.image }} style={styles.scenarioImage} />
            <View style={styles.scenarioContent}>
              <Text style={styles.scenarioTitle}>{currentScenario.title}</Text>
              <Text style={styles.scenarioDescription}>{currentScenario.description}</Text>
            </View>
          </Animated.View>
          
          <Animated.View style={[styles.optionsContainer, optionsAnimatedStyle]}>
            <Text style={styles.optionsTitle}>What would you do?</Text>
            
            {currentScenario.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => handleSelectOption(option)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
                <ArrowRight size={20} color="#2ED573" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={[styles.consequenceContainer, consequenceAnimatedStyle]}>
          {selectedOption && (
            <>
              <View style={styles.consequenceCard}>
                <View style={styles.consequenceHeader}>
                  <Text style={styles.consequenceTitle}>Consequence</Text>
                  <View style={[
                    styles.scoreTag,
                    selectedOption.score >= 70 ? styles.scoreTagHigh : 
                    selectedOption.score >= 40 ? styles.scoreTagMedium : 
                    styles.scoreTagLow
                  ]}>
                    <Text style={styles.scoreTagText}>{selectedOption.score} points</Text>
                  </View>
                </View>
                
                <Text style={styles.consequenceText}>{selectedOption.consequence}</Text>
                
                <View style={styles.feedbackContainer}>
                  {selectedOption.score >= 70 ? (
                    <View style={styles.feedbackIconGood}>
                      <Check size={24} color="#FFF" />
                    </View>
                  ) : (
                    <View style={styles.feedbackIconPoor}>
                      <AlertCircle size={24} color="#FFF" />
                    </View>
                  )}
                  
                  <Text style={[
                    styles.feedbackText,
                    selectedOption.score >= 70 ? styles.feedbackTextGood : styles.feedbackTextPoor
                  ]}>
                    {selectedOption.score >= 70 ? 'Good choice!' : 
                     selectedOption.score >= 40 ? 'Could be better' : 
                     'Poor choice'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNextScenario}
              >
                <Text style={styles.nextButtonText}>
                  {currentScenarioIndex < showScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
                </Text>
                <ArrowRight size={20} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderResultsStage = () => {
    // Calculate final score (average of all scenario scores)
    const finalScore = Math.round((totalScore + (selectedOption?.score || 0)) / showScenarios.length);
    
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{finalScore}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
        
        <Text style={styles.resultsFeedback}>
          {finalScore >= 80 ? 'Great job!' : 
           finalScore >= 60 ? 'Good effort!' : 
           'Keep practicing!'}
        </Text>
        
        <View style={styles.resultsCard}>
          <Text style={styles.resultsCardTitle}>Decision Summary</Text>
          
          {showScenarios.map((scenario, index) => {
            // For the scenarios that were played
            if (index <= currentScenarioIndex) {
              // For the current scenario (if the game ended with a selection but before moving to the next)
              const optionScore = index === currentScenarioIndex 
                ? selectedOption?.score || 0 
                : (showScenarios[index].options.find(o => 
                    o.id === (index === currentScenarioIndex ? selectedOption?.id : null)
                  )?.score || 0);
              
              return (
                <View key={scenario.id} style={styles.scenarioSummary}>
                  <Text style={styles.summaryScenarioTitle}>{scenario.title}</Text>
                  <View style={[
                    styles.summaryScoreTag,
                    optionScore >= 70 ? styles.scoreTagHigh : 
                    optionScore >= 40 ? styles.scoreTagMedium : 
                    styles.scoreTagLow
                  ]}>
                    <Text style={styles.summaryScoreText}>{optionScore}</Text>
                  </View>
                </View>
              );
            }
            return null;
          })}
        </View>
        
        <View style={styles.resultsButtonsContainer}>
          <TouchableOpacity 
            style={styles.playAgainButton}
            onPress={() => router.replace('/(tabs)/situation-game/play')}
          >
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)/situation-game')}
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
        
        <Text style={styles.headerTitle}>Situation Game</Text>
        
        {gameStage !== 'results' && (
          <View style={styles.progressContainer}>
            {showScenarios.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot,
                  index === currentScenarioIndex ? styles.progressDotActive : 
                  index < currentScenarioIndex ? styles.progressDotCompleted : 
                  styles.progressDotInactive
                ]} 
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {(gameStage === 'scenario' || gameStage === 'consequence') && renderScenarioStage()}
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
  progressContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  progressDotActive: {
    backgroundColor: '#2ED573',
  },
  progressDotCompleted: {
    backgroundColor: '#A8E5C4',
  },
  progressDotInactive: {
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  sceneContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  scenarioContainer: {
    width: '100%',
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scenarioImage: {
    width: '100%',
    height: 200,
  },
  scenarioContent: {
    padding: 16,
  },
  scenarioTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 8,
  },
  scenarioDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  optionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  consequenceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
  },
  consequenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  consequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  consequenceTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1E293B',
  },
  scoreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreTagHigh: {
    backgroundColor: '#E6F9F0',
  },
  scoreTagMedium: {
    backgroundColor: '#FFF3E0',
  },
  scoreTagLow: {
    backgroundColor: '#FEE2E2',
  },
  scoreTagText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  consequenceText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackIconGood: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ED573',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedbackIconPoor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedbackText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  feedbackTextGood: {
    color: '#2ED573',
  },
  feedbackTextPoor: {
    color: '#FF6B6B',
  },
  nextButton: {
    backgroundColor: '#2ED573',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
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
    backgroundColor: '#2ED573',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2ED573',
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
  scenarioSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryScenarioTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  summaryScoreTag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryScoreText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#1E293B',
  },
  resultsButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#2ED573',
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