import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  NativeModules,
  Platform,
} from 'react-native';

const { ContactModule } = NativeModules;

const App = () => {
  const [contacts, setContacts] = useState([]);

  const requestPermissionAndLoad = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts to display them.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      console.log('Permission result:', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadContacts();
      } else {
        console.warn('Permission denied');
      }
    }
  }, []);

  const loadContacts = () => {
    ContactModule.getContacts()
      .then(data => setContacts(data))
      .catch(err => console.warn(err));
  };

  useEffect(() => {
    requestPermissionAndLoad();
  }, [requestPermissionAndLoad]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  item: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  name: { fontSize: 16 },
  phone: { color: '#333' },
});

export default App;
