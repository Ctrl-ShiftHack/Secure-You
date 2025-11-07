import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, List, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function ContactsScreen() {
  const contacts: Contact[] = []; // We'll add Supabase integration later

  const renderItem = ({ item }: { item: Contact }) => (
    <List.Item
      title={item.name}
      description={item.phone}
      left={props => <List.Icon {...props} icon="account" />}
      right={props => (
        <IconButton
          {...props}
          icon="pencil"
          onPress={() => router.push('/contacts/edit')}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text>No emergency contacts added yet</Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        )}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/contacts/new')}
        />
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});