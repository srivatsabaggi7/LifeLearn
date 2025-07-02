import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, ChevronRight, Clock, Award, MessageSquare } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SituationGameScreen() {
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const scoresString = await AsyncStorage.getItem('situationGameScores');
        if (scoresString) {
          const scores = JSON.parse(scoresString);
          setGamesPlayed(scores.length);
          
          if (scores.length > 0) {
            // Find high score
            const maxScore = Math.max(...scores.map((s: any) => s.score));
            setHighScore(maxScore);
            
            // Get last played date
            const lastGame = scores[scores.length - 1];
            if (lastGame && lastGame.date) {
              const date = new Date(lastGame.date);
              setLastPlayed(date.toLocaleDateString());
            }
          }
        }
      } catch (error) {
        console.error('Error loading situation game data:', error);
      }
    };

    loadGameData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <MessageSquare size={24} color="#2ED573" />
        <Text style={styles.title}>Situation Game</Text>
      </View>

      <View style={styles.banner}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/4709285/pexels-photo-4709285.jpeg' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Decision Challenge</Text>
          <Text style={styles.bannerDescription}>
            Learn to make smart choices in different situations!
          </Text>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => router.push('/(tabs)/situation-game/play')}
          >
            <Text style={styles.playButtonText}>Play Now</Text>
            <Play size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Award size={20} color="#2ED573" />
          <Text style={styles.statValue}>{highScore}</Text>
          <Text style={styles.statLabel}>High Score</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#2ED573" />
          <Text style={styles.statValue}>{lastPlayed || '-'}</Text>
          <Text style={styles.statLabel}>Last Played</Text>
        </View>
        <View style={styles.statCard}>
          <MessageSquare size={20} color="#2ED573" />
          <Text style={styles.statValue}>{gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>How to Play</Text>

      <View style={styles.instructionCard}>
        <View style={styles.instructionStep}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Read the Scenario</Text>
            <Text style={styles.instructionText}>
              You'll be presented with a real-life situation that requires a decision.
            </Text>
          </View>
        </View>

        <View style={styles.instructionStep}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Choose Your Response</Text>
            <Text style={styles.instructionText}>
              Select from multiple options how you would respond to the situation.
            </Text>
          </View>
        </View>

        <View style={styles.instructionStep}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>See the Consequences</Text>
            <Text style={styles.instructionText}>
              Learn about the consequences of your choice and how it affects others.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => router.push('/(tabs)/situation-game/play')}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
        <ChevronRight size={20} color="#FFF" />
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginLeft: 12,
  },
  banner: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  bannerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#2ED573',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  instructionCard: {
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
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#2ED573',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  instructionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  startButton: {
    backgroundColor: '#2ED573',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
});