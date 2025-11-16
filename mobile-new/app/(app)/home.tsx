import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sosContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.sosButton}
            labelStyle={styles.sosButtonText}
          >
            SOS
          </Button>
        </View>
        <Text style={styles.helpText}>
          Press and hold the SOS button in case of emergency
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    backgroundColor: '#ff0000',
  },
  sosButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  helpText: {
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.6,
  },
});