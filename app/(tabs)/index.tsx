import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, Trophy, Zap, Star, Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [recentScores, setRecentScores] = useState({
    budget: 0,
    situation: 0,
    memory: 0
  });
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const name = await AsyncStorage.getItem('childName');
        if (name) setChildName(name);

        // Get recent scores
        const budgetScores = JSON.parse(await AsyncStorage.getItem('budgetGameScores') || '[]');
        const situationScores = JSON.parse(await AsyncStorage.getItem('situationGameScores') || '[]');
        const memoryScores = JSON.parse(await AsyncStorage.getItem('memoryGameScores') || '[]');

        setRecentScores({
          budget: budgetScores.length > 0 ? budgetScores[budgetScores.length - 1]?.score || 0 : 0,
          situation: situationScores.length > 0 ? situationScores[situationScores.length - 1]?.score || 0 : 0,
          memory: memoryScores.length > 0 ? memoryScores[memoryScores.length - 1]?.score || 0 : 0
        });

        // Get streak data
        const streak = await AsyncStorage.getItem('streak') || '0';
        setStreakCount(parseInt(streak, 10));
      } catch (error) {
        console.error('Error loading home data:', error);
      }
    };

    loadData();
  }, []);

  const navigateToGame = (game: string) => {
    router.push(`/(tabs)/${game}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{childName || 'Learner'}!</Text>
        </View>
        <View style={styles.streakContainer}>
          <Zap size={16} color="#FF9F43" />
          <Text style={styles.streakText}>{streakCount} day streak</Text>
        </View>
      </View>

      <View style={styles.featuredSection}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg' }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle}>Continue Learning</Text>
          <Text style={styles.featuredSubtitle}>Master new skills every day!</Text>
          <TouchableOpacity 
            style={styles.featuredButton}
            onPress={() => {
              // Determine which game to continue based on recent activity
              const lowestScore = Math.min(
                recentScores.budget, 
                recentScores.situation, 
                recentScores.memory
              );
              
              if (lowestScore === recentScores.budget) {
                navigateToGame('budget-game');
              } else if (lowestScore === recentScores.situation) {
                navigateToGame('situation-game');
              } else {
                navigateToGame('memory-game');
              }
            }}
          >
            <Text style={styles.featuredButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Games</Text>

      <View style={styles.gameCardsContainer}>
        <TouchableOpacity 
          style={styles.gameCard}
          onPress={() => navigateToGame('budget-game')}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <ShoppingBag size={24} color="#4A7BF7" />
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>Budget Game</Text>
            <Text style={styles.gameCardDescription}>Learn shopping on a budget</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameCard}
          onPress={() => navigateToGame('situation-game')}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <MessageSquare size={24} color="#2ED573" />
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>Situation Game</Text>
            <Text style={styles.gameCardDescription}>Make smart decisions</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameCard}
          onPress={() => navigateToGame('memory-game')}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Brain size={24} color="#FF9F43" />
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>Memory Game</Text>
            <Text style={styles.gameCardDescription}>Train your memory skills</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Trophy size={20} color="#4A7BF7" />
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statCard}>
          <Star size={20} color="#FF9F43" />
          <Text style={styles.statValue}>
            {Math.floor((recentScores.budget + recentScores.situation + recentScores.memory) / 3)}
          </Text>
          <Text style={styles.statLabel}>Avg. Score</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={20} color="#2ED573" />
          <Text style={styles.statValue}>{streakCount}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    </ScrollView>
  );
}

import { ShoppingBag, MessageSquare, Brain } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  nameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FF9F43',
    marginLeft: 4,
  },
  featuredSection: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  featuredTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  featuredSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featuredButton: {
    backgroundColor: '#4A7BF7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  gameCardsContainer: {
    marginBottom: 24,
  },
  gameCard: {
    flexDirection: 'row',
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
  gameIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameCardContent: {
    flex: 1,
  },
  gameCardTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  gameCardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
});